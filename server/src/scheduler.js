import { admin } from "./supabase.js";
import { publishPost, refreshConnectionToken } from "./instagram.js";

/**
 * Processa todos os posts com status 'agendado' cujo scheduled_at já passou.
 * Publica (mock ou real), atualiza status para 'publicado' e grava em publish_log.
 * Retorna um resumo { processed, published, failed, results }.
 */
export async function runScheduler() {
  const nowIso = new Date().toISOString();
  const { data: posts, error } = await admin
    .from("posts")
    .select("*")
    .eq("status", "agendado")
    .lte("scheduled_at", nowIso);

  if (error) return { processed: 0, published: 0, failed: 0, error: error.message };

  const results = [];
  let published = 0,
    failed = 0;

  for (const post of posts ?? []) {
    const res = await processPost(post);
    if (res.ok) published++;
    else failed++;
    results.push({ post_id: post.id, title: post.title, ...res });
  }

  return { processed: posts?.length ?? 0, published, failed, results };
}

/**
 * Publica um único post (busca conexão, publica, atualiza status e grava log).
 * Reutilizado pelo scheduler e pela publicação manual ("Publicar agora").
 */
export async function processPost(post) {
  const { data: conn } = await admin
    .from("instagram_connections")
    .select("*")
    .eq("client_id", post.client_id)
    .maybeSingle();

  const res = await publishPost(post, conn);

  if (res.ok) {
    await admin
      .from("posts")
      .update({ status: "publicado", published_at: new Date().toISOString() })
      .eq("id", post.id);
  } else if (res.tokenError && conn?.id) {
    await admin.from("instagram_connections").update({ status: "expired" }).eq("id", conn.id);
  }

  await admin.from("publish_log").insert({
    post_id: post.id,
    client_id: post.client_id,
    status: res.ok ? "success" : "error",
    external_id: res.externalId ?? null,
    message: res.message,
    mock: !!res.mock,
  });

  return res;
}

/** Publica agora um post pelo id (ação manual). */
export async function publishNow(postId) {
  const { data: post } = await admin.from("posts").select("*").eq("id", postId).maybeSingle();
  if (!post) return { ok: false, message: "Post não encontrado." };
  return processPost(post);
}

/**
 * F.1: renova tokens de conexões 'connected' que expiram em <= 7 dias.
 * No-op se não houver IG_APP_ID (modo mock/sem credenciais).
 */
export async function runTokenRefresh() {
  if (!process.env.IG_APP_ID) return { refreshed: 0, skipped: "sem IG_APP_ID" };
  const limit = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const { data: conns } = await admin
    .from("instagram_connections")
    .select("*")
    .eq("status", "connected")
    .lte("token_expires_at", limit);

  let refreshed = 0;
  for (const conn of conns ?? []) {
    try {
      const t = await refreshConnectionToken(conn);
      await admin
        .from("instagram_connections")
        .update({
          access_token: t.access_token,
          token_expires_at: t.token_expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conn.id);
      refreshed++;
    } catch (err) {
      await admin.from("instagram_connections").update({ status: "expired" }).eq("id", conn.id);
      console.error(`[token-refresh] conn ${conn.id}: ${err.message}`);
    }
  }
  return { refreshed };
}
