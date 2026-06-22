import { useQuery, useMutation } from "@tanstack/react-query";

interface InsightValue {
  value: number;
  end_time: string;
}

interface Insight {
  name: string;
  period: string;
  values: InsightValue[];
  title: string;
  description: string;
  id: string;
}

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  from?: { username: string; name: string };
  like_count: number;
  replies?: { data: Comment[] };
  mock?: boolean;
}

interface Conversation {
  id: string;
  participants: Array<{ username: string; name: string }>;
  senders: Array<{ username: string }>;
  last_message?: { text: string; timestamp: string };
  mock?: boolean;
}

interface Message {
  id: string;
  from?: { username: string; name: string };
  message: string;
  timestamp: string;
  mock?: boolean;
}

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8787";

/**
 * Hook para buscar insights de uma conta Instagram.
 * @param accountId - ID da conexão Instagram
 * @param period - "7days" ou "30days"
 * @param enabled - Se deve fazer fetch
 */
export function useInstagramInsights(
  accountId: string | null,
  period: "7days" | "30days" = "7days",
  enabled = true
) {
  return useQuery({
    queryKey: ["instagram-insights", accountId, period],
    queryFn: async () => {
      if (!accountId) throw new Error("accountId é obrigatório");
      const response = await fetch(
        `${API_URL}/api/instagram/monitoring/insights/${accountId}?period=${period}`
      );
      if (!response.ok) throw new Error("Falha ao buscar insights");
      return (await response.json()) as { success: boolean; insights: Insight[] };
    },
    enabled: enabled && !!accountId,
    refetchInterval: 60_000, // Atualizar a cada minuto
  });
}

/**
 * Hook para buscar comentários de uma conta Instagram.
 * @param accountId - ID da conexão Instagram
 * @param limit - Limite de comentários
 * @param enabled - Se deve fazer fetch
 */
export function useInstagramComments(
  accountId: string | null,
  limit = 25,
  enabled = true
) {
  return useQuery({
    queryKey: ["instagram-comments", accountId],
    queryFn: async () => {
      if (!accountId) throw new Error("accountId é obrigatório");
      const response = await fetch(
        `${API_URL}/api/instagram/monitoring/comments/${accountId}?limit=${limit}`
      );
      if (!response.ok) throw new Error("Falha ao buscar comentários");
      return (await response.json()) as {
        success: boolean;
        comments_count: number;
        comments: Comment[];
      };
    },
    enabled: enabled && !!accountId,
    refetchInterval: 120_000, // Atualizar a cada 2 minutos
  });
}

/**
 * Hook para buscar DMs (conversas) de uma conta Instagram.
 * @param accountId - ID da conexão Instagram
 * @param enabled - Se deve fazer fetch
 */
export function useInstagramDMs(accountId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["instagram-dms", accountId],
    queryFn: async () => {
      if (!accountId) throw new Error("accountId é obrigatório");
      const response = await fetch(
        `${API_URL}/api/instagram/monitoring/dms/${accountId}`
      );
      if (!response.ok) throw new Error("Falha ao buscar DMs");
      return (await response.json()) as { success: boolean; conversations_count: number };
    },
    enabled: enabled && !!accountId,
    refetchInterval: 120_000, // Atualizar a cada 2 minutos
  });
}

/**
 * Mutation para responder a um comentário.
 */
export function useReplyToComment() {
  return useMutation({
    mutationFn: async ({
      commentId,
      accountId,
      message,
    }: {
      commentId: string;
      accountId: string;
      message: string;
    }) => {
      const response = await fetch(
        `${API_URL}/api/instagram/monitoring/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, message }),
        }
      );
      if (!response.ok) throw new Error("Falha ao responder comentário");
      return (await response.json()) as { success: boolean; reply_id: string };
    },
  });
}

/**
 * Mutation para enviar mensagem em uma conversa.
 */
export function useSendDM() {
  return useMutation({
    mutationFn: async ({
      conversationId,
      accountId,
      message,
    }: {
      conversationId: string;
      accountId: string;
      message: string;
    }) => {
      const response = await fetch(
        `${API_URL}/api/instagram/monitoring/dms/${conversationId}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, message }),
        }
      );
      if (!response.ok) throw new Error("Falha ao enviar mensagem");
      return (await response.json()) as { success: boolean; message_id: string };
    },
  });
}
