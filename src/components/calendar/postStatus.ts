// Configuração visual centralizada de status de posts.
// Reutilizável em qualquer vista do calendário (Mês, Semana, Progressiva).

export type StatusDot = "green" | "yellow" | "red" | "gray";

export type StatusInfo = {
  label: string;
  /** Classes Tailwind para badge (background + texto). */
  cls: string;
  /** Indicador visual semafórico (🟢 🟡 🔴). */
  dot: StatusDot;
};

export const POST_STATUS: Record<string, StatusInfo> = {
  rascunho: { label: "Rascunho", cls: "bg-muted text-muted-foreground", dot: "gray" },
  aprovacao: { label: "Em aprovação", cls: "bg-warning/15 text-warning", dot: "yellow" },
  ajuste: { label: "Ajuste", cls: "bg-destructive/15 text-destructive", dot: "red" },
  aprovado: { label: "Aprovado", cls: "bg-info/15 text-info", dot: "yellow" },
  agendado: { label: "Agendado", cls: "bg-primary/15 text-primary", dot: "yellow" },
  publicado: { label: "Publicado", cls: "bg-success/15 text-success", dot: "green" },
  erro: { label: "Erro", cls: "bg-destructive/15 text-destructive", dot: "red" },
};

export function getStatusInfo(status: string): StatusInfo {
  return (
    POST_STATUS[status] ?? { label: status, cls: "bg-muted text-muted-foreground", dot: "gray" }
  );
}

const DOT_COLOR: Record<StatusDot, string> = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
  gray: "bg-muted-foreground",
};

export function getDotColor(dot: StatusDot): string {
  return DOT_COLOR[dot];
}
