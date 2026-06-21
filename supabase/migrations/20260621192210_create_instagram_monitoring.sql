-- ========== INSTAGRAM MONITORING (Fase 1: infraestrutura) ==========
-- Estende a conexão Instagram existente (instagram_connections, por client_id)
-- com cache de insights e flags de monitoramento, e adiciona tabelas de
-- comentários e DMs sincronizados. Fases 2-4 (Graph API, frontend, websocket)
-- usam esta estrutura.

-- instagram_connections já existe (client_id, ig_user_id, ig_username, page_id,
-- access_token, token_expires_at, status, connected_by, created_at, updated_at).
-- Aqui apenas estendemos com as colunas de monitoramento (Fase 1).

-- app_role ENUM já foi criado em migrações anteriores, não duplicamos aqui.
-- Apenas estendemos as tabelas existentes e adicionamos as novas tabelas.
ALTER TABLE public.instagram_connections
  ADD COLUMN IF NOT EXISTS insights_cache JSONB,
  ADD COLUMN IF NOT EXISTS insights_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS insights_period TEXT,
  ADD COLUMN IF NOT EXISTS is_monitored BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_comments_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_dms_sync TIMESTAMPTZ;

-- ========== INSTAGRAM COMMENTS ==========
CREATE TABLE IF NOT EXISTS public.instagram_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.instagram_connections(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  comment_id TEXT NOT NULL,
  author_username TEXT,
  author_avatar_url TEXT,
  text TEXT,
  likes_count INT NOT NULL DEFAULT 0,
  replied_to_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id, comment_id)
);
CREATE INDEX IF NOT EXISTS instagram_comments_account_idx ON public.instagram_comments(account_id);
CREATE INDEX IF NOT EXISTS instagram_comments_post_idx ON public.instagram_comments(post_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_comments TO authenticated;
GRANT ALL ON public.instagram_comments TO service_role;
ALTER TABLE public.instagram_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "instagram_comments access by client" ON public.instagram_comments FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM public.instagram_connections c
      WHERE c.id = account_id AND public.can_access_client(c.client_id, auth.uid())
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.instagram_connections c
      WHERE c.id = account_id AND public.can_access_client(c.client_id, auth.uid())
    )
  );

-- ========== INSTAGRAM DMs ==========
CREATE TABLE IF NOT EXISTS public.instagram_dms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.instagram_connections(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  sender_username TEXT,
  sender_avatar_url TEXT,
  text TEXT,
  is_from_me BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id, conversation_id)
);
CREATE INDEX IF NOT EXISTS instagram_dms_account_idx ON public.instagram_dms(account_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_dms TO authenticated;
GRANT ALL ON public.instagram_dms TO service_role;
ALTER TABLE public.instagram_dms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "instagram_dms access by client" ON public.instagram_dms FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM public.instagram_connections c
      WHERE c.id = account_id AND public.can_access_client(c.client_id, auth.uid())
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.instagram_connections c
      WHERE c.id = account_id AND public.can_access_client(c.client_id, auth.uid())
    )
  );
