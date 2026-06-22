-- Create instagram_report_links table for shareable insight reports
CREATE TABLE IF NOT EXISTS instagram_report_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  instagram_account_id UUID NOT NULL REFERENCES instagram_connections(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  period VARCHAR(10) NOT NULL DEFAULT '30days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  views_count INT DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_instagram_report_links_token ON instagram_report_links(token);

-- Create index for cleanup queries (expired links)
CREATE INDEX IF NOT EXISTS idx_instagram_report_links_expires_at ON instagram_report_links(expires_at);

-- Create index for client lookups
CREATE INDEX IF NOT EXISTS idx_instagram_report_links_client_id ON instagram_report_links(client_id);

-- Enable RLS
ALTER TABLE instagram_report_links ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to create links for their clients
CREATE POLICY "Users can create report links for their clients"
  ON instagram_report_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = instagram_report_links.client_id
        AND clients.agency_id = (
          SELECT agency_id FROM profiles
          WHERE profiles.user_id = auth.uid()
        )
    )
  );

-- Policy: Allow authenticated users to view their own report links
CREATE POLICY "Users can view their own report links"
  ON instagram_report_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = instagram_report_links.client_id
        AND clients.agency_id = (
          SELECT agency_id FROM profiles
          WHERE profiles.user_id = auth.uid()
        )
    )
  );

-- Policy: Allow anyone to view valid (non-expired) reports via token
CREATE POLICY "Public access to valid report tokens"
  ON instagram_report_links
  FOR SELECT
  USING (
    expires_at > NOW()
  );
