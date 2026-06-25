import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTable() {
  try {
    console.log("🔄 Criando tabela instagram_auth_links...");

    // Verificar se a tabela já existe
    let checkTable;
    try {
      const { data } = await supabase.from("instagram_auth_links").select("short_code").limit(1);
      checkTable = data;
    } catch (e) {
      checkTable = null;
    }

    if (checkTable !== null) {
      console.log("✅ Tabela instagram_auth_links JÁ EXISTE!");
      return;
    }

    // Criar tabela via RPC (se disponível) ou inserir dummy data para gerar tabela
    const sqlCreateTable = `
      CREATE TABLE IF NOT EXISTS public.instagram_auth_links (
        short_code TEXT NOT NULL PRIMARY KEY,
        client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_instagram_auth_links_client_id
      ON public.instagram_auth_links(client_id);

      ALTER TABLE public.instagram_auth_links ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS instagram_auth_links_select ON public.instagram_auth_links
      FOR SELECT USING (true);
    `;

    // Tentar executar via postgres CLI (se disponível no servidor)
    // Ou tentar criar inserindo um registro dummy
    console.log("⏳ Tentando criar tabela via workaround...");

    // Criar em background via trigger (não vai funcionar, mas vamos tentar fetch)
    const { data, error } = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({ sql: sqlCreateTable }),
    })
      .then((r) => r.json())
      .catch(() => ({ error: { message: "RPC não disponível" } }));

    if (error) {
      console.log("⚠️ RPC não disponível no Supabase anon.");
      console.log("📋 Solução: Execute manualmente este SQL no Supabase SQL Editor:");
      console.log("https://ewerfpxniciegagnretb.supabase.co/project/default/sql/new\n");
      console.log(sqlCreateTable);
      return;
    }

    console.log("✅ Tabela instagram_auth_links criada com sucesso!");
  } catch (err) {
    console.error("❌ Erro:", err.message);
  }
}

await createTable();
