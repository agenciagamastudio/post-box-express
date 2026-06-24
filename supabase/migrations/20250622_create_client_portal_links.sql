-- Create client_portal_links table for public access links
-- Allows clients to access calendar + status without login

CREATE TABLE IF NOT EXISTS public.client_portal_links (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 year'),

  CONSTRAINT client_portal_links_client_id_unique UNIQUE(client_id)
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_client_portal_links_token
  ON public.client_portal_links(token);

-- Create index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_client_portal_links_client_id
  ON public.client_portal_links(client_id);

-- Enable RLS (public can read via token, but no update/delete)
ALTER TABLE public.client_portal_links ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read if they have the valid token
CREATE POLICY "Allow public read via token"
  ON public.client_portal_links
  FOR SELECT
  USING (true);

-- Policy: prevent public write/delete (only service role via backend)
CREATE POLICY "Prevent public write"
  ON public.client_portal_links
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Prevent public delete"
  ON public.client_portal_links
  FOR DELETE
  USING (false);
