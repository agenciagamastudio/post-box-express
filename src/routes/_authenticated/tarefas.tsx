import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TaskStatus = "a_fazer" | "fazendo" | "feito";

export const Route = createFileRoute("/_authenticated/tarefas")({ component: Tasks });

const COLS = [
  { id: "a_fazer" as const, label: "A fazer" },
  { id: "fazendo" as const, label: "Fazendo" },
  { id: "feito" as const, label: "Feito" },
] as const;

function Tasks() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const { error } = await supabase.from("tasks").insert({
        title,
        due_at: due ? new Date(due).toISOString() : null,
        created_by: u.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tarefa criada");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setTitle("");
      setDue("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Tarefas"
        description="Demandas do dia a dia da equipe."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input
                    type="datetime-local"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={!title}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {COLS.map((c) => {
          const list = tasks?.filter((t) => t.status === c.id) ?? [];
          return (
            <div key={c.id} className="rounded-xl bg-muted/40 p-3">
              <div className="mb-3 px-1 text-sm font-semibold">
                {c.label}{" "}
                <span className="ml-1 text-xs text-muted-foreground">({list.length})</span>
              </div>
              <div className="space-y-2">
                {list.map((t) => (
                  <Card key={t.id} className="p-3 text-sm">
                    <div className="font-medium">{t.title}</div>
                    {t.due_at && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(t.due_at).toLocaleString("pt-BR")}
                      </div>
                    )}
                    <select
                      value={t.status}
                      onChange={(e) => move.mutate({ id: t.id, status: e.target.value })}
                      className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      {COLS.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.label}
                        </option>
                      ))}
                    </select>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
