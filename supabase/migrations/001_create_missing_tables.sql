-- Migration: Create missing tables (publish_log and post_reviews)
-- Date: 2026-06-25
-- Purpose: Add tables referenced in TypeScript code but missing from schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. CREATE publish_log TABLE
-- ========================================
-- Purpose: Track all publishing attempts to Instagram/TikTok/etc
-- Used by: automacao.tsx, useNotifications.ts, integracoes.$clientId.tsx

CREATE TABLE IF NOT EXISTS public.publish_log (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  instagram_connection_id UUID REFERENCES public.instagram_connections(id) ON DELETE SET NULL,

  -- Publishing Details
  status TEXT NOT NULL CHECK (status IN ('pending', 'publishing', 'published', 'failed', 'retrying')),
  provider TEXT NOT NULL CHECK (provider IN ('instagram', 'tiktok', 'x', 'facebook', 'outras')),

  -- External Platform Reference
  external_id TEXT,  -- e.g., Instagram Media ID, TikTok video ID
  external_url TEXT, -- Direct link to published content

  -- Error Handling
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Metadata
  published_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,  -- Platform-specific metadata

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Indexes for common queries
  CONSTRAINT publish_log_post_id_status_idx UNIQUE (post_id, status, provider)
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_publish_log_post_id ON public.publish_log(post_id);
CREATE INDEX IF NOT EXISTS idx_publish_log_status ON public.publish_log(status);
CREATE INDEX IF NOT EXISTS idx_publish_log_provider ON public.publish_log(provider);
CREATE INDEX IF NOT EXISTS idx_publish_log_created_at ON public.publish_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publish_log_instagram_connection ON public.publish_log(instagram_connection_id);

-- Enable Row Level Security
ALTER TABLE public.publish_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see publish_log for their posts
CREATE POLICY publish_log_select_policy ON public.publish_log
  FOR SELECT USING (
    (SELECT client_id FROM posts WHERE posts.id = publish_log.post_id)
    IN (SELECT client_id FROM client_members WHERE user_id = auth.uid())
    OR
    (SELECT created_by FROM posts WHERE posts.id = publish_log.post_id) = auth.uid()
  );

-- RLS Policy: Only post creators can insert publish_log
CREATE POLICY publish_log_insert_policy ON public.publish_log
  FOR INSERT WITH CHECK (
    (SELECT created_by FROM posts WHERE posts.id = post_id) = auth.uid()
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_publish_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS publish_log_update_timestamp ON public.publish_log;
CREATE TRIGGER publish_log_update_timestamp
  BEFORE UPDATE ON public.publish_log
  FOR EACH ROW
  EXECUTE FUNCTION update_publish_log_timestamp();

-- ========================================
-- 2. CREATE post_reviews TABLE
-- ========================================
-- Purpose: Track post approval/rejection workflow
-- Used by: calendario.tsx, kanban.tsx, post approval flow

CREATE TABLE IF NOT EXISTS public.post_reviews (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Review Details
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  comment TEXT,

  -- Revision Tracking
  revision_round INTEGER DEFAULT 1,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewer_name TEXT,  -- Denormalized for easier queries

  -- Constraint: One review per reviewer per post per round
  CONSTRAINT post_reviews_unique_reviewer_round UNIQUE (post_id, reviewer_id, revision_round)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_post_reviews_post_id ON public.post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_reviewer_id ON public.post_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_status ON public.post_reviews(status);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created_at ON public.post_reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.post_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view reviews for posts they have access to
CREATE POLICY post_reviews_select_policy ON public.post_reviews
  FOR SELECT USING (
    (SELECT client_id FROM posts WHERE posts.id = post_reviews.post_id)
    IN (SELECT client_id FROM client_members WHERE user_id = auth.uid())
    OR
    reviewer_id = auth.uid()
    OR
    (SELECT created_by FROM posts WHERE posts.id = post_reviews.post_id) = auth.uid()
  );

-- RLS Policy: Only assigned reviewers can create reviews
CREATE POLICY post_reviews_insert_policy ON public.post_reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid()
  );

-- RLS Policy: Only reviewer can update their review
CREATE POLICY post_reviews_update_policy ON public.post_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_post_reviews_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  NEW.reviewer_name = (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = NEW.reviewer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_reviews_update_timestamp ON public.post_reviews;
CREATE TRIGGER post_reviews_update_timestamp
  BEFORE UPDATE ON public.post_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reviews_timestamp();

-- Trigger to set reviewer_name on insert
DROP TRIGGER IF EXISTS post_reviews_set_reviewer_name ON public.post_reviews;
CREATE TRIGGER post_reviews_set_reviewer_name
  BEFORE INSERT ON public.post_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reviews_timestamp();

-- ========================================
-- 3. UPDATE posts TABLE (add missing columns if needed)
-- ========================================
-- Ensure posts table has format column for WeekView compatibility
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('image', 'video', 'carousel', 'story')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'pending_review', 'approved', 'scheduled', 'published', 'failed', 'archived')) DEFAULT 'draft';

-- ========================================
-- 4. GRANT PERMISSIONS
-- ========================================
-- Allow anon users to see published posts
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.post_reviews TO anon;
GRANT SELECT ON public.publish_log TO anon;

-- Allow authenticated users to manage their own data
GRANT SELECT, INSERT, UPDATE ON public.post_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.publish_log TO authenticated;

-- Service role (backend) has full access
GRANT ALL PRIVILEGES ON public.post_reviews TO service_role;
GRANT ALL PRIVILEGES ON public.publish_log TO service_role;

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================
-- Run these to verify tables were created correctly:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('publish_log', 'post_reviews', 'posts');
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'publish_log';
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'post_reviews';
