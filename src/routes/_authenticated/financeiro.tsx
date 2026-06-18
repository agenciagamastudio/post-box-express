import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/financeiro")({ component: Finance });

function Finance() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("receber");
  const [clientId, setClientId] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id,name").order("name");
      return data ?? [];
    },
  });
  const { data: entries } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_entries").select("*, clients(name,color)").order("due_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      if (!clientId) throw new Error("Escolha um cliente");
      const { error } = await supabase.from("finance_entries").insert({
        client_id: clientId, kind: kind as any, description: desc, amount: Number(amount),
        due_at: due || null, created_by: u.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Lançamento criado"); qc.invalidateQueries({ queryKey: ["finance"] }); setOpen(false); setDesc(""); setAmount(""); setDue(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePaid = useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const { error } = await supabase.from("finance_entries").update({ paid_at: paid ? new Date().toISOString().slice(0, 10) : null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["finance"] }),
  });

  const totals = (entries ?? []).reduce(
    (acc, e) => {
      const v = Number(e.amount);
      if (e.kind === "receber") { e.paid_at ? acc.recebido += v : acc.aReceber += v; }
      else { e.paid_at ? acc.pago += v : acc.aPagar += v; }
      return acc;
    },
    { aReceber: 0, recebido: 0, aPagar: 0, pago: 0 },
  );

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Financeiro"
        description="Contas a receber e a pagar por cliente."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Novo lançamento</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={kind} onValueChange={setKind}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receber">A receber</SelectItem>
                        <SelectItem value="pagar">A pagar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
                      <SelectContent>{clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Descrição</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Valor</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={() => create.mutate()} disabled={!desc || !amount}>Salvar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Stat label="A receber" value={fmt(totals.aReceber)} accent="text-success" />
        <Stat label="Recebido" value={fmt(totals.recebido)} accent="text-success" />
        <Stat label="A pagar" value={fmt(totals.aPagar)} accent="text-warning" />
        <Stat label="Pago" value={fmt(totals.pago)} accent="text-muted-foreground" />
      </div>

      <Card className="mt-6 divide-y divide-border">
        {entries?.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: (e.clients as any)?.color ?? "#A78BFA" }} />
              <div>
                <div className="font-medium">{e.description}</div>
                <div className="text-xs text-muted-foreground">{(e.clients as any)?.name} · {e.kind === "receber" ? "A receber" : "A pagar"} · vence {e.due_at ?? "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-semibold ${e.kind === "receber" ? "text-success" : "text-warning"}`}>{fmt(Number(e.amount))}</span>
              <Button size="sm" variant={e.paid_at ? "secondary" : "outline"} onClick={() => togglePaid.mutate({ id: e.id, paid: !e.paid_at })}>
                {e.paid_at ? "Pago" : "Marcar pago"}
              </Button>
            </div>
          </div>
        ))}
        {(!entries || entries.length === 0) && <div className="p-8 text-center text-sm text-muted-foreground">Sem lançamentos ainda.</div>}
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-semibold ${accent}`}>{value}</div>
    </Card>
  );
}
