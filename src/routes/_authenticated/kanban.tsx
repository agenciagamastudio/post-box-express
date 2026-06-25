import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Link2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { PostDialog } from "@/components/app/PostDialog";
import { PostDetailDialog, type DetailPost } from "@/components/app/PostDetailDialog";
import { toast } from "sonner";
import { type StatusType } from "@/types/posts";

type PostReview = {
  comment: string | null;
  status: string;
  reviewer_name: string | null;
  created_at: string;
};

type KanbanPost = {
  id: string;
  title: string;
  caption: string;
  cover_url: string | null;
  status: string;
  network: string;
  format: string;
  scheduled_at: string | null;
  published_at: string | null;
  clients: { name: string; color: string } | null;
  post_reviews: PostReview[];
};

export const Route = createFileRoute("/_authenticated/kanban")({
  component: Kanban,
});

const COLS = [
  { id: "rascunho", label: "Rascunho" },
  { id: "aprovacao", label: "Em aprovação" },
  { id: "ajuste", label: "Ajuste" },
  { id: "aprovado", label: "Aprovado" },
  { id: "agendado", label: "Agendado" },
  { id: "publicado", label: "Publicado" },
] as const;

function Kanban() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailPost | null>(null);

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id,title,caption,cover_url,status,network,format,scheduled_at,published_at,clients(name,color),post_reviews(comment,status,reviewer_name,created_at)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const move = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusType }) => {
      const { error } = await supabase.from("posts").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      toast.success("Status atualizado");
    },
  });

  const openEdit = (postId: string) => {
    setDetail(null);
    setEditId(postId);
    setOpen(true);
  };

  const resend = async (postId: string) => {
    const { error: e1 } = await supabase
      .from("posts")
      .update({ status: "aprovacao" })
      .eq("id", postId);
    if (e1) return toast.error(e1.message);
    const { data, error } = await supabase
      .from("post_reviews")
      .insert({ post_id: postId })
      .select("token")
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["posts"] });
    setDetail(null);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/review/${data.token}`);
      toast.success("Reenviado para aprovação — link copiado");
    } catch {
      toast.success("Reenviado para aprovação");
    }
  };

  const approvalLink = async (postId: string) => {
    // Cria um token de revisão e copia o link público de aprovação.
    const { data, error } = await supabase
      .from("post_reviews")
      .insert({ post_id: postId })
      .select("token")
      .single();
    if (error) return toast.error(error.message);
    const url = `${window.location.origin}/review/${data.token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link de aprovação copiado — envie para o cliente");
    } catch {
      toast.success(url);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Quadro de posts"
        description="Arraste mentalmente — ou use o botão para mudar status."
        action={
          <Button
            onClick={() => {
              setEditId(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo post
          </Button>
        }
      />
      <div className="mt-6 grid gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
        {COLS.map((col) => {
          const list = posts?.filter((p) => p.status === col.id) ?? [];
          return (
            <div key={col.id} className="min-w-[220px] rounded-xl bg-muted/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((p) => (
                  <Card
                    key={p.id}
                    className="cursor-pointer p-3 transition hover:ring-1 hover:ring-primary/40"
                    onClick={() => setDetail(p as unknown as DetailPost)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: p.clients?.color ?? "#A78BFA" }}
                      />
                      <span className="text-xs text-muted-foreground">{p.clients?.name}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm font-medium">{p.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
                      <span>{p.network}</span>·<span>{p.format}</span>
                    </div>
                    {(() => {
                      const reviews = p.post_reviews ?? [];
                      const change = reviews
                        .filter((r) => r.status === "changes_requested" && r.comment)
                        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
                      if (!change) return null;
                      return (
                        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs">
                          <div className="mb-0.5 flex items-center gap-1 font-medium text-destructive">
                            <MessageSquare className="h-3 w-3" /> Ajuste pedido
                            {change.reviewer_name ? ` por ${change.reviewer_name}` : ""}
                          </div>
                          <div className="text-foreground">"{change.comment}"</div>
                        </div>
                      );
                    })()}
                    <select
                      value={p.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        move.mutate({ id: p.id, status: e.target.value });
                      }}
                      className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      {COLS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approvalLink(p.id);
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <Link2 className="h-3 w-3" /> Link de aprovação
                    </button>
                  </Card>
                ))}
                {list.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <PostDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditId(null);
        }}
        postId={editId}
      />
      <PostDetailDialog
        post={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        onApprovalLink={approvalLink}
        onEdit={openEdit}
        onResend={resend}
      />
    </div>
  );
}
