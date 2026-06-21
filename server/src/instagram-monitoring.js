// Instagram Monitoring — Fase 2: Endpoints REST para insights, comments, DMs
// Sincroniza dados com Supabase (instagram_comments, instagram_dms).

import { Router } from "express";
import { supabase } from "./supabase.js";
import {
  fetchInsights,
  fetchComments,
  fetchConversations,
  fetchMessages,
  replyToComment,
  sendMessage,
} from "./instagram-graph.js";

const router = Router();

/**
 * GET /api/instagram/monitoring/insights/:accountId
 * Busca insights de uma conta Instagram.
 * Query params: period=7days|30days
 */
router.get("/insights/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;
    const { period = "7days" } = req.query;

    // 1. Buscar conexão Instagram do Supabase
    const { data: conn, error } = await supabase
      .from("instagram_connections")
      .select("id, ig_user_id, access_token")
      .eq("id", accountId)
      .single();

    if (error || !conn) {
      return res.status(404).json({ error: "Conta Instagram não encontrada" });
    }

    // 2. Buscar insights da Graph API
    const insights = await fetchInsights(conn.ig_user_id, conn.access_token, period);

    // 3. Atualizar cache no Supabase
    await supabase
      .from("instagram_connections")
      .update({
        insights_cache: insights,
        insights_updated_at: new Date().toISOString(),
        insights_period: period,
      })
      .eq("id", accountId);

    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/instagram/monitoring/comments/:accountId
 * Busca comentários e sincroniza com instagram_comments.
 * Query params: limit=25
 */
router.get("/comments/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;
    const { limit = 25 } = req.query;

    // 1. Buscar conexão
    const { data: conn, error } = await supabase
      .from("instagram_connections")
      .select("id, ig_user_id, access_token, client_id")
      .eq("id", accountId)
      .single();

    if (error || !conn) {
      return res.status(404).json({ error: "Conta Instagram não encontrada" });
    }

    // 2. Buscar comentários
    const result = await fetchComments(conn.ig_user_id, conn.access_token, limit);
    const comments = result.comments || [];

    // 3. Sincronizar com instagram_comments
    for (const comment of comments) {
      await supabase.from("instagram_comments").upsert(
        {
          account_id: accountId,
          comment_id: comment.id,
          post_id: comment.post_id || "unknown",
          author_username: comment.from?.username || null,
          author_avatar_url: comment.from?.picture?.data?.url || null,
          text: comment.text,
          likes_count: comment.like_count || 0,
          replied_to_id: comment.replied_to_id || null,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "account_id,comment_id" }
      );
    }

    res.json({ success: true, comments_count: comments.length, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/instagram/monitoring/dms/:accountId
 * Busca conversas (DMs) e sincroniza com instagram_dms.
 */
router.get("/dms/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;

    // 1. Buscar conexão
    const { data: conn, error } = await supabase
      .from("instagram_connections")
      .select("id, ig_user_id, access_token")
      .eq("id", accountId)
      .single();

    if (error || !conn) {
      return res.status(404).json({ error: "Conta Instagram não encontrada" });
    }

    // 2. Buscar conversas
    const result = await fetchConversations(conn.ig_user_id, conn.access_token);
    const conversations = result.conversations || [];

    // 3. Para cada conversa, buscar mensagens e sincronizar
    for (const conv of conversations) {
      const msgs = await fetchMessages(conv.id, conn.access_token);
      const messages = msgs.messages || [];

      for (const msg of messages) {
        await supabase.from("instagram_dms").upsert(
          {
            account_id: accountId,
            conversation_id: conv.id,
            sender_username: msg.from?.username || null,
            sender_avatar_url: msg.from?.picture?.data?.url || null,
            text: msg.message,
            is_from_me: msg.from?.username === conn.ig_user_id, // Simplificado
            synced_at: new Date().toISOString(),
          },
          { onConflict: "account_id,conversation_id" }
        );
      }
    }

    res.json({ success: true, conversations_count: conversations.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/instagram/monitoring/comments/:commentId/reply
 * Responde a um comentário.
 * Body: { accountId, message }
 */
router.post("/comments/:commentId/reply", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { accountId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message é obrigatório" });
    }

    // Buscar token
    const { data: conn, error } = await supabase
      .from("instagram_connections")
      .select("access_token")
      .eq("id", accountId)
      .single();

    if (error || !conn) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    // Responder comentário
    const result = await replyToComment(commentId, conn.access_token, message);

    res.json({ success: true, reply_id: result.reply_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/instagram/monitoring/dms/:conversationId/send
 * Envia mensagem em uma conversa.
 * Body: { accountId, message }
 */
router.post("/dms/:conversationId/send", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { accountId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message é obrigatório" });
    }

    // Buscar token
    const { data: conn, error } = await supabase
      .from("instagram_connections")
      .select("access_token")
      .eq("id", accountId)
      .single();

    if (error || !conn) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    // Enviar mensagem
    const result = await sendMessage(conversationId, conn.access_token, message);

    res.json({ success: true, message_id: result.message_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
