// Instagram Graph API — Fase 2: Fetch insights, comments, DMs
// Reutiliza tokens de instagram_connections já armazenados no Supabase.
// Suporta mock mode para testes sem credenciais reais.

const IG_GRAPH = "https://graph.instagram.com";

const isMock = () => String(process.env.PUBLISH_MOCK).toLowerCase() === "true";

/**
 * Chamada genérica à Graph API com token.
 * @param {string} path - Caminho (ex: /ig_user_id/insights)
 * @param {string} token - Access token
 * @param {object} params - Parâmetros da query
 */
async function igGraphCall(path, token, params = {}) {
  if (isMock()) {
    return { mock: true, data: [] };
  }

  if (!token) throw new Error("Token Instagram ausente");

  const url = new URL(`${IG_GRAPH}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, v);
    }
  }

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.error) {
    throw new Error(`Graph API Error (${data.error.code}): ${data.error.message}`);
  }

  return data;
}

/**
 * Busca insights de um usuário Instagram (últimos 7 ou 30 dias).
 * @param {string} igUserId - ID do usuário Instagram
 * @param {string} token - Access token
 * @param {string} period - "7days" ou "30days"
 */
export async function fetchInsights(igUserId, token, period = "7days") {
  const since = calculatePeriodStart(period);
  const until = new Date().toISOString();

  const data = await igGraphCall(`/${igUserId}/insights`, token, {
    metric: "impressions,reach,profile_views,website_clicks,phone_call_clicks",
    period: "day",
    since,
    until,
  });

  if (data.mock) {
    return {
      mock: true,
      insights: [
        { date: new Date().toISOString().split("T")[0], impressions: 1234, reach: 890, profile_views: 45 },
      ],
    };
  }

  return { insights: data.data || [] };
}

/**
 * Busca comentários em posts de um usuário.
 * @param {string} igUserId - ID do usuário Instagram
 * @param {string} token - Access token
 * @param {number} limit - Limite de comentários
 */
export async function fetchComments(igUserId, token, limit = 25) {
  const data = await igGraphCall(`/${igUserId}/comments`, token, {
    fields: "id,text,timestamp,from,like_count,replies.limit(3)",
    limit,
  });

  if (data.mock) {
    return {
      mock: true,
      comments: [
        {
          id: "mock_comment_1",
          text: "Que legal! 🔥",
          timestamp: new Date().toISOString(),
          from: { username: "user_123", name: "João Silva" },
          like_count: 5,
          replies: { data: [] },
        },
      ],
    };
  }

  return { comments: data.data || [] };
}

/**
 * Busca conversas (DMs) de um usuário.
 * @param {string} igUserId - ID do usuário Instagram
 * @param {string} token - Access token
 * @param {number} limit - Limite de conversas
 */
export async function fetchConversations(igUserId, token, limit = 10) {
  const data = await igGraphCall(`/${igUserId}/conversations`, token, {
    fields: "id,participants,senders,last_message",
    limit,
  });

  if (data.mock) {
    return {
      mock: true,
      conversations: [
        {
          id: "mock_conv_1",
          participants: [{ username: "user_abc", name: "Maria" }],
          senders: [{ username: "user_abc" }],
          last_message: { text: "Tudo bem?", timestamp: new Date().toISOString() },
        },
      ],
    };
  }

  return { conversations: data.data || [] };
}

/**
 * Busca mensagens de uma conversa específica.
 * @param {string} conversationId - ID da conversa
 * @param {string} token - Access token
 */
export async function fetchMessages(conversationId, token) {
  const data = await igGraphCall(`/${conversationId}/messages`, token, {
    fields: "id,from,message,timestamp,story",
    limit: 50,
  });

  if (data.mock) {
    return {
      mock: true,
      messages: [
        {
          id: "mock_msg_1",
          from: { username: "user_abc", name: "Maria" },
          message: "Olá, tudo bem?",
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  return { messages: data.data || [] };
}

/**
 * Responde a um comentário (requer token com permissão de management).
 * @param {string} commentId - ID do comentário
 * @param {string} token - Access token
 * @param {string} message - Texto da resposta
 */
export async function replyToComment(commentId, token, message) {
  if (isMock()) {
    return { mock: true, reply_id: `mock_reply_${Date.now()}` };
  }

  const data = await igGraphCall(`/${commentId}/replies`, token, {
    message,
  });

  if (data.error) {
    throw new Error(`Falha ao responder comentário: ${data.error.message}`);
  }

  return { reply_id: data.id };
}

/**
 * Envia mensagem para uma conversa.
 * @param {string} conversationId - ID da conversa
 * @param {string} token - Access token
 * @param {string} message - Texto da mensagem
 */
export async function sendMessage(conversationId, token, message) {
  if (isMock()) {
    return { mock: true, message_id: `mock_msg_${Date.now()}` };
  }

  const data = await igGraphCall(`/${conversationId}/messages`, token, {
    message,
  });

  if (data.error) {
    throw new Error(`Falha ao enviar mensagem: ${data.error.message}`);
  }

  return { message_id: data.id };
}

/**
 * Calcula data de início baseado no período.
 */
function calculatePeriodStart(period) {
  const now = new Date();
  const days = period === "30days" ? 30 : 7;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return start.toISOString();
}
