/**
 * Post types for social media scheduling
 */

export type NetworkType = "instagram" | "tiktok" | "x" | "outras";
export type FormatType = "feed" | "carrossel" | "reels" | "story" | "video";
export type StatusType =
  | "rascunho"
  | "aprovacao"
  | "ajuste"
  | "aprovado"
  | "agendado"
  | "publicado";

export interface Post {
  id: string;
  title: string;
  caption: string;
  client_id: string;
  network: NetworkType;
  format: FormatType;
  status: StatusType;
  scheduled_at: string | null;
  cover_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PostCreatePayload {
  title: string;
  caption: string;
  client_id: string;
  network: NetworkType;
  format: FormatType;
  status: StatusType;
  scheduled_at: string | null;
  cover_url: string | null;
  created_by: string;
}
