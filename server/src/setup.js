// Setup endpoints — Criar tabelas e configuração
import { Router } from "express";
import { admin } from "./supabase.js";

const router = Router();

/**
 * POST /setup/create-instagram-portal
 * Cria a tabela instagram_report_links e políticas RLS
 * Endpoint protegido — requer bearer token do serviço
 */
router.post("/create-instagram-portal", async (req, res) => {
  try {
    // Validar token (proteção básica)
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.SETUP_TOKEN || "setup-token-123";

    if (!authHeader || !authHeader.includes(expectedToken)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("[setup] Criando tabela instagram_report_links...");

    // SQL para criar a tabela (idempotente — IF NOT EXISTS)
    const createTableSQL = `
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
    `;

    // Criar índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_instagram_report_links_token ON instagram_report_links(token);
      CREATE INDEX IF NOT EXISTS idx_instagram_report_links_expires_at ON instagram_report_links(expires_at);
      CREATE INDEX IF NOT EXISTS idx_instagram_report_links_client_id ON instagram_report_links(client_id);
    `;

    // Habilitar RLS
    const enableRLSSQL = `ALTER TABLE instagram_report_links ENABLE ROW LEVEL SECURITY;`;

    // Policies (criar se não existir)
    const createPoliciesSQL = `
      -- Policy: Allow authenticated users to create links
      CREATE POLICY IF NOT EXISTS "Users can create report links for their clients"
        ON instagram_report_links FOR INSERT
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

      -- Policy: Allow authenticated users to view their own links
      CREATE POLICY IF NOT EXISTS "Users can view their own report links"
        ON instagram_report_links FOR SELECT
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

      -- Policy: Allow public access to valid (non-expired) tokens
      CREATE POLICY IF NOT EXISTS "Public access to valid report tokens"
        ON instagram_report_links FOR SELECT
        USING (expires_at > NOW());
    `;

    // Executar SQL via admin client (com service key)
    // Nota: Supabase não expõe um método direto para exec_sql, então usamos rpc
    // Se isso falhar, orientamos o usuário a usar o CLI

    console.log("[setup] Tentando criar via admin.rpc...");

    // Teste: verificar se tabela já existe
    const { data: existingTable, error: checkError } = await admin
      .from("information_schema.tables")
      .select("*")
      .eq("table_name", "instagram_report_links")
      .single();

    if (!checkError && existingTable) {
      console.log("[setup] Tabela já existe!");
      return res.json({
        ok: true,
        message: "Tabela instagram_report_links já existe",
        table_exists: true,
      });
    }

    // Tentar criar a tabela diretamente
    // (isso é um workaround — normalmente usaria SQL direto ou Supabase Studio)
    console.log("[setup] Tabela não encontrada. Tentando criar...");

    // Usar um trigger/function se disponível, ou orientar para CLI
    const manualCreateResult = await createTableManually();

    if (!manualCreateResult.ok) {
      return res.status(500).json({
        ok: false,
        error: manualCreateResult.error,
        message: "Falha ao criar tabela via admin client. Use: supabase db push",
        instruction: "Execute 'supabase login' seguido de 'supabase db push' no seu terminal.",
      });
    }

    res.json({
      ok: true,
      message: "Tabela criada com sucesso",
      table_created: true,
    });
  } catch (err) {
    console.error("[setup error]", err.message);
    res.status(500).json({
      ok: false,
      error: err.message,
      instruction: `Para criar a tabela manualmente, execute no seu terminal:
        1. supabase login
        2. supabase db push
        3. Selecione o projeto 'ewerfpxniciegagnretb'`,
    });
  }
});

/**
 * Função auxiliar: Criar tabela via SQL direto (se possível)
 */
async function createTableManually() {
  try {
    // Nota: Isso é um workaround. O Supabase não expõe um RPC de exec_sql por padrão.
    // Se tivéssemos acesso via pg_net ou similar, seria possível.
    // Por enquanto, retornamos instrução manual.

    return {
      ok: false,
      error: "Não há permissão para executar SQL direto via API. Use Supabase CLI.",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * GET /setup/status
 * Verifica o status da configuração
 */
router.get("/status", async (req, res) => {
  try {
    const { data: tables, error } = await admin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_catalog", "postgres");

    const hasPortalTable = tables?.some((t) => t.table_name === "instagram_report_links");

    res.json({
      ok: true,
      database_connected: !error,
      portal_table_exists: !!hasPortalTable,
      tables_count: tables?.length || 0,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

export default router;
