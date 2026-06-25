-- Migration: Create missing tables (publish_log and post_reviews)
-- Simplified version without external FK constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. CREATE publish_log TABLE (simplified)
-- ========================================
CREATE TABLE IF NOT EXISTS public.publish_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  instagram_connection_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'publishing', 'published', 'failed', 'retrying')),
  provider TEXT NOT NULL CHECK (provider IN ('instagram', 'tiktok', 'x', 'facebook', 'outras')),
  external_id TEXT,
  external_url TEXT,
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  published_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_publish_log_post_id ON public.publish_log(post_id);
CREATE INDEX IF NOT EXISTS idx_publish_log_status ON public.publish_log(status);
CREATE INDEX IF NOT EXISTS idx_publish_log_provider ON public.publish_log(provider);
CREATE INDEX IF NOT EXISTS idx_publish_log_created_at ON public.publish_log(created_at DESC);

-- ========================================
-- 2. CREATE post_reviews TABLE (simplified)
-- ========================================
CREATE TABLE IF NOT EXISTS public.post_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  comment TEXT,
  revision_round INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewer_name TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reviews_post_id ON public.post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_reviewer_id ON public.post_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_status ON public.post_reviews(status);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created_at ON public.post_reviews(created_at DESC);

-- ========================================
-- 3. GRANT PERMISSIONS
-- ========================================
GRANT SELECT ON public.publish_log TO anon;
GRANT SELECT ON public.post_reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON public.post_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.publish_log TO authenticated;

-- Done!
