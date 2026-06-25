import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Plus, Building2, Instagram, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clientes")({
  component: Clients,
});

type IgConnection = {
  id: string;
  client_id: string;
  ig_username: string | null;
  status: string;
};

function Clients() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [color, setColor] = useState("#88ce11");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: connections } = useQuery({
    queryKey: ["ig-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_connections")
        .select("id,client_id,ig_username,status");
      if (error) throw error;
      return (data ?? []) as IgConnection[];
    },
  });

  const connByClient = new Map((connections ?? []).map((c) => [c.client_id, c]));

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const { error } = await supabase.from("clients").insert({
        owner_id: u.user.id,
        name,
        handle: handle || null,
        color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente criado");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["clients-list"] });
      setOpen(false);
      setName("");
      setHandle("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error("ID não especificado");
      const { error } = await supabase
        .from("clients")
        .update({ name, handle: handle || null, color })
        .eq("id", editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente atualizado");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["clients-list"] });
      setOpen(false);
      setEditingId(null);
      setName("");
      setHandle("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delete_ = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente deletado");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["clients-list"] });
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setName(client.name);
    setHandle(client.handle || "");
    setColor(client.color);
    setOpen(true);
  };

  const handleNewClient = () => {
    setEditingId(null);
    setName("");
    setHandle("");
    setColor("#88ce11");
    setOpen(true);
  };

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Clientes"
        description="Cadastre as marcas e perfis que você atende e conecte o Instagram de cada um."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewClient}>
                <Plus className="mr-2 h-4 w-4" />
                Novo cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar cliente" : "Novo cliente"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>@ do Instagram</Label>
                  <Input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@marca"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-20 p-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => (editingId ? update.mutate() : create.mutate())}
                  disabled={!name || (editingId ? update.isPending : create.isPending)}
                >
                  {editingId ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deletar cliente?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Todos os dados associados a este cliente serão removidos.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => delete_.mutate(deleteConfirm)}
                disabled={delete_.isPending}
              >
                Deletar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clients?.map((c) => {
          const conn = connByClient.get(c.id);
          const connected = conn?.status === "connected";
          return (
            <Card key={c.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ background: c.color }}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.handle || "—"}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {c.active ? "ativo" : "inativo"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Instagram
                    className={`h-4 w-4 ${connected ? "text-primary" : "text-muted-foreground"}`}
                  />
                  {connected ? (
                    <span className="text-foreground">{conn?.ig_username || "Conectado"}</span>
                  ) : (
                    <span className="text-muted-foreground">Instagram não conectado</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 border-t border-border pt-3">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/integracoes/$clientId" params={{ clientId: c.id }}>
                    <Instagram className="mr-1 h-4 w-4" />
                    Integrações
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(c)}
                  className="px-2"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(c.id)}
                  className="px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
        {(!clients || clients.length === 0) && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum cliente ainda. Clique em "Novo cliente" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
