import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PostDialog } from "@/components/app/PostDialog";
import { toast } from "sonner";

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

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,status,network,format,scheduled_at,clients(name,color)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const move = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("posts").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      toast.success("Status atualizado");
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Quadro de posts"
        description="Arraste mentalmente — ou use o botão para mudar status."
        action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo post</Button>}
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
                  <Card key={p.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: (p.clients as any)?.color ?? "#A78BFA" }} />
                      <span className="text-xs text-muted-foreground">{(p.clients as any)?.name}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm font-medium">{p.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
                      <span>{p.network}</span>·<span>{p.format}</span>
                    </div>
                    <select
                      value={p.status}
                      onChange={(e) => move.mutate({ id: p.id, status: e.target.value })}
                      className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      {COLS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
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
      <PostDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
