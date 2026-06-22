import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link2, MessageSquare, Pencil, Send } from "lucide-react";

type Review = { comment: string | null; status: string; reviewer_name: string | null; created_at: string };
export type DetailPost = {
  id: string;
  title: string;
  caption?: string | null;
  cover_url?: string | null;
  status: string;
  network: string;
  format: string;
  scheduled_at: string | null;
  published_at?: string | null;
  clients?: { name?: string } | any;
  post_reviews?: Review[];
};

const STATUS: Record<string, string> = {
  rascunho: "Rascunho",
  aprovacao: "Em aprovação",
  ajuste: "Ajuste",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
};

function fmt(iso?: string | null) {
  return iso ? new Date(iso).toLocaleString("pt-BR") : null;
}

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
  onApprovalLink,
  onEdit,
  onResend,
}: {
  post: DetailPost | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApprovalLink: (id: string) => void;
  onEdit: (id: string) => void;
  onResend: (id: string) => void;
}) {
  if (!post) return null;
  // até 3 pedidos de ajuste mais recentes
  const feedbacks = (post.post_reviews ?? [])
    .filter((r) => r.status === "changes_requested" && r.comment)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {post.cover_url && (
            <img src={post.cover_url} alt={post.title} className="aspect-square w-full rounded-xl object-cover" />
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
              {STATUS[post.status] ?? post.status}
            </span>
            {post.clients?.name && <span className="text-muted-foreground">{post.clients.name}</span>}
            <span className="text-muted-foreground">{post.network} · {post.format}</span>
          </div>

          {post.caption && (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Legenda</div>
              <p className="whitespace-pre-wrap text-sm">{post.caption}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted-foreground">Agendado</div>
              <div>{fmt(post.scheduled_at) ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Publicado</div>
              <div>{fmt(post.published_at) ?? "—"}</div>
            </div>
          </div>

          {/* Histórico de feedbacks (até 3) */}
          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> Pedidos de ajuste do cliente ({feedbacks.length})
            </div>
            {feedbacks.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum pedido de ajuste.</p>
            ) : (
              <div className="space-y-2">
                {feedbacks.map((f, i) => (
                  <div key={i} className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs">
                    <div className="mb-0.5 font-medium text-destructive">
                      {f.reviewer_name || "Cliente"} · {fmt(f.created_at)}
                    </div>
                    <div className="text-foreground">"{f.comment}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-start">
          <Button variant="outline" onClick={() => onEdit(post.id)}>
            <Pencil className="mr-1 h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" onClick={() => onResend(post.id)}>
            <Send className="mr-1 h-4 w-4" /> Reenviar p/ aprovação
          </Button>
          <Button variant="outline" onClick={() => onApprovalLink(post.id)}>
            <Link2 className="mr-1 h-4 w-4" /> Link de aprovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
