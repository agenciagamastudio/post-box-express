import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ewerfpxniciegagnretb.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZXJmcHhuaWNpZWdhZ25yZXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY5MzQ0MCwiZXhwIjoxNzM0MzQ1NDQwfQ.KWCrL8LNB6vHQwYKPWfH3G3QcO5s_nWx0rIvvRtUVbc";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log("🚀 Aplicando migration SQL...\n");

  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_instagram_report_links_token ON instagram_report_links(token);
    CREATE INDEX IF NOT EXISTS idx_instagram_report_links_expires_at ON instagram_report_links(expires_at);
    CREATE INDEX IF NOT EXISTS idx_instagram_report_links_client_id ON instagram_report_links(client_id);

    ALTER TABLE instagram_report_links ENABLE ROW LEVEL SECURITY;
  `;

  try {
    console.log("Executando SQL...");

    const { data, error } = await admin.rpc("exec_sql", { sql });

    if (error) {
      console.error("❌ Erro:", error.message);
      return;
    }

    console.log("✅ Migration aplicada com sucesso!");

    // Testar se tabela foi criada
    console.log("\n✅ Testando acesso à tabela...");
    const { data: testData, error: testError } = await admin
      .from("instagram_report_links")
      .select("*")
      .limit(1);

    if (testError) {
      console.log("⚠️ Erro ao testar tabela:", testError.message);
    } else {
      console.log("✅ Tabela criada e acessível!");
    }
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

applyMigration();
