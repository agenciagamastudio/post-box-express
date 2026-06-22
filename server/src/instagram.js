// Publicação e OAuth via Instagram Business Login (Instagram API com login do Instagram).
// Fluxo igual ao do app de referência: instagram.com/oauth + graph.instagram.com,
// escopos instagram_business_*. NÃO exige Página do Facebook.
// Fase 1: PUBLISH_MOCK=true → simula sucesso sem chamar a API.

const IG_AUTH = "https://www.instagram.com/oauth/authorize";
const IG_TOKEN = "https://api.instagram.com/oauth/access_token";
const IG_GRAPH = "https://graph.instagram.com";
const SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
].join(",");

const isMock = () => String(process.env.PUBLISH_MOCK).toLowerCase() === "true";

/** Monta a URL de autorização do Instagram (usada pela rota /auth/instagram/start). */
export function buildAuthUrl(clientId) {
  const url = new URL(IG_AUTH);
  url.searchParams.set("client_id", process.env.IG_APP_ID);
  url.searchParams.set("redirect_uri", process.env.IG_OAUTH_REDIRECT);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", String(clientId)); // carrega o client_id de volta
  return url.toString();
}

async function igGet(path, params) {
  const url = new URL(`${IG_GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const j = await fetch(url).then((r) => r.json());
  if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
  return j;
}

/**
 * Troca o `code` do OAuth por uma conexão Instagram completa.
 * Retorna { ig_user_id, ig_username, access_token, token_expires_at }.
 */
export async function exchangeCodeForConnection(code) {
  const appId = process.env.IG_APP_ID;
  const secret = process.env.IG_APP_SECRET;
  const redirect = process.env.IG_OAUTH_REDIRECT;
  if (!appId || !secret) throw new Error("IG_APP_ID/SECRET não configurados");

  // 1) code -> token curto (POST form-urlencoded em api.instagram.com)
  const form = new URLSearchParams({
    client_id: appId,
    client_secret: secret,
    grant_type: "authorization_code",
    redirect_uri: redirect,
    code,
  });
  const short = await fetch(IG_TOKEN, { method: "POST", body: form }).then((r) => r.json());
  if (short.error_type || short.error_message) {
    throw new Error(short.error_message || "Falha ao trocar code por token");
  }
  const shortToken = short.access_token;

  // 2) token curto -> token de longa duração (~60 dias)
  const long = await igGet("/access_token", {
    grant_type: "ig_exchange_token",
    client_secret: secret,
    access_token: shortToken,
  });
  const userToken = long.access_token;
  const expiresIn = long.expires_in || 60 * 24 * 3600;

  // 3) dados da conta (user_id é o id usado para publicar)
  const me = await igGet("/me", { fields: "user_id,username", access_token: userToken });
  const igId = me.user_id || short.user_id;
  if (!igId) throw new Error("Não foi possível obter o ID da conta Instagram");

  return {
    ig_user_id: String(igId),
    ig_username: me.username ? `@${me.username}` : null,
    access_token: userToken,
    token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

/**
 * Publica um post. Retorna { ok, externalId?, mock, tokenError?, message }.
 */
export async function publishPost(post, conn) {
  if (isMock()) {
    return {
      ok: true,
      mock: true,
      externalId: `mock_${Date.now()}`,
      message: "Publicação simulada (PUBLISH_MOCK=true)",
    };
  }

  if (!conn?.ig_user_id || !conn?.access_token) {
    return { ok: false, mock: false, message: "Conexão Instagram ausente ou sem token" };
  }
  // Suporte atual: feed/imagem única. Reels/Story/carrossel = Epic F.2.4.
  if (!["feed", "carrossel"].includes(post.format)) {
    return {
      ok: false,
      mock: false,
      message: `Formato "${post.format}" ainda não suportado na publicação automática (apenas feed/imagem).`,
    };
  }
  if (!post.cover_url) {
    return { ok: false, mock: false, message: "Post sem cover_url (imagem pública obrigatória)" };
  }

  try {
    // 1) cria container (com retry em erro transitório)
    const c = await withRetry(() =>
      igPost(`/${conn.ig_user_id}/media`, {
        image_url: post.cover_url,
        ...(post.caption ? { caption: post.caption } : {}),
        access_token: conn.access_token,
      })
    );
    // 2) aguarda o container ficar pronto (FINISHED) antes de publicar
    await waitContainerReady(c.id, conn.access_token);
    // 3) publica o container
    const p = await withRetry(() =>
      igPost(`/${conn.ig_user_id}/media_publish`, {
        creation_id: c.id,
        access_token: conn.access_token,
      })
    );
    return { ok: true, mock: false, externalId: p.id, message: "Publicado no Instagram" };
  } catch (err) {
    const tokenError = /OAuthException|code\s*190|expired|session|token/i.test(err.message);
    return { ok: false, mock: false, tokenError, message: `Erro Graph API: ${err.message}` };
  }
}

// Aguarda o container de mídia ficar pronto (status_code = FINISHED) antes de publicar.
// Resolve o erro "Media ID is not available" (container ainda processando).
async function waitContainerReady(creationId, token, maxTries = 10, delayMs = 2000) {
  for (let i = 0; i < maxTries; i++) {
    const r = await igGet(`/${creationId}`, { fields: "status_code", access_token: token });
    if (r.status_code === "FINISHED") return;
    if (r.status_code === "ERROR" || r.status_code === "EXPIRED") {
      throw new Error(`Container falhou: ${r.status_code}`);
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  throw new Error("Container não ficou pronto a tempo (timeout)");
}

// POST na Graph API do Instagram; lança Error em caso de erro da API.
async function igPost(path, params) {
  const url = new URL(`${IG_GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url, { method: "POST" });
  const j = await r.json();
  if (j.error) {
    const e = new Error(j.error.message || JSON.stringify(j.error));
    e.code = j.error.code;
    e.isTransient = r.status >= 500 || j.error.code === 4 || j.error.code === 17 || j.error.code === 32;
    throw e;
  }
  return j;
}

// Retry com backoff exponencial + jitter apenas para erros transitórios.
async function withRetry(fn, max = 3, base = 1000) {
  let last;
  for (let i = 0; i < max; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (!err.isTransient || i === max - 1) throw err;
      const delay = base * 2 ** i + Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw last;
}

/**
 * Renova o token de longa duração do Instagram (ig_refresh_token).
 * Retorna { access_token, token_expires_at } ou lança erro.
 */
export async function refreshConnectionToken(conn) {
  const j = await igGet("/refresh_access_token", {
    grant_type: "ig_refresh_token",
    access_token: conn.access_token,
  });
  return {
    access_token: j.access_token,
    token_expires_at: new Date(Date.now() + (j.expires_in || 60 * 24 * 3600) * 1000).toISOString(),
  };
}
