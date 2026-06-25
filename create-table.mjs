import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ewerfpxniciegagnretb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZXJmcHhuaWNpZWdhZ25yZXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc0MTI4OSwiZXhwIjoyMDk3MzE3Mjg5fQ._LKbBkOaJibrEPParf17G1TsHVC9HIFxcO1fWAaq6VM";

const admin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTable() {
  try {
    console.log("🔄 Testando se tabela instagram_auth_links existe...");

    const { data, error } = await admin.from("instagram_auth_links").select("short_code").limit(1);

    if (error?.code === "PGRST116") {
      console.log("❌ Tabela não existe. Você precisa criá-la manualmente no Supabase SQL Editor.");
      console.log("\n📋 Execute este SQL no Supabase Dashboard:");
      console.log(`
-- Criar tabela instagram_auth_links
CREATE TABLE IF NOT EXISTS public.instagram_auth_links (
  short_code TEXT NOT NULL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice para queries rápidas
CREATE INDEX IF NOT EXISTS idx_instagram_auth_links_client_id
ON public.instagram_auth_links(client_id);

-- Ativar RLS (segurança)
ALTER TABLE public.instagram_auth_links ENABLE ROW LEVEL SECURITY;

-- Policy: leitura pública (short_code é pública)
CREATE POLICY "instagram_auth_links_read_public"
ON public.instagram_auth_links
FOR SELECT USING (true);

-- Policy: insert apenas do backend (service role)
-- (implícito via Supabase — service key tem acesso total)
      `);
      return;
    } else if (!error) {
      console.log("✅ Tabela instagram_auth_links JÁ EXISTE!");
      console.log("📊 Amostra de dados:");
      console.log(JSON.stringify(data, null, 2));
      return;
    }
  } catch (err) {
    console.error("❌ Erro ao conectar:", err.message);
    console.log(
      "\n⚠️ Se erro de autenticação, copie o SQL acima e execute manualmente no Supabase.",
    );
  }
}

await createTable();
