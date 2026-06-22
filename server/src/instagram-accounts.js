// Endpoints de contas Instagram monitoradas (Fase 1: skeleton).
// CRUD básico sobre instagram_connections, por usuário autenticado.
// Fase 2 implementa as chamadas reais à Graph API (insights/comentários/DMs).

import express from "express";
import { admin } from "./supabase.js";
import { buildAuthUrl } from "./instagram.js";

export const instagramAccountsRouter = express.Router();

/**
 * GET /api/instagram/accounts
 * Lista as contas Instagram conectadas que o usuário pode acessar.
 * Fase 1: skeleton — assume client_id explícito via query string até
 * a Fase 3 (frontend) resolver o usuário autenticado via sessão.
 */
instagramAccountsRouter.get("/accounts", async (req, res) => {
  const { client_id } = req.query;
  try {
    let query = admin
      .from("instagram_connections")
      .select(
        "id,client_id,ig_user_id,ig_username,page_id,status,is_monitored,insights_period,insights_updated_at,last_comments_sync,last_dms_sync,token_expires_at,created_at,updated_at",
      );
    if (client_id) query = query.eq("client_id", client_id);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json({ ok: true, accounts: data ?? [] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * POST /api/instagram/accounts/connect
 * Inicia o fluxo OAuth para conectar uma nova conta Instagram a um cliente.
 * Body: { client_id }
 */
instagramAccountsRouter.post("/accounts/connect", async (req, res) => {
  const { client_id } = req.body || {};
  if (!client_id) return res.status(400).json({ ok: false, message: "Faltou client_id." });
  if (!process.env.IG_APP_ID) {
    return res.status(503).json({
      ok: false,
      message:
        "Conexão com Instagram ainda não disponível: IG_APP_ID/SECRET pendente de configuração.",
    });
  }
  res.json({ ok: true, authUrl: buildAuthUrl(client_id) });
});

/**
 * POST /api/instagram/accounts/callback
 * Completa o OAuth recebendo o `code` (uso alternativo ao redirect direto
 * em /auth/instagram/callback, para fluxos client-side). Fase 2 implementa
 * a troca completa via exchangeCodeForConnection + persistência.
 */
instagramAccountsRouter.post("/accounts/callback", async (req, res) => {
  const { code, client_id } = req.body || {};
  if (!code || !client_id) {
    return res.status(400).json({ ok: false, message: "Faltou code/client_id." });
  }
  res
    .status(501)
    .json({ ok: false, message: "Callback OAuth completo será implementado na Fase 2." });
});

/**
 * DELETE /api/instagram/accounts/:accountId
 * Desconecta (remove) uma conta Instagram monitorada.
 */
instagramAccountsRouter.delete("/accounts/:accountId", async (req, res) => {
  try {
    const { error } = await admin
      .from("instagram_connections")
      .delete()
      .eq("id", req.params.accountId);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});
