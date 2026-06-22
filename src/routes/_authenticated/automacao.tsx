import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/automacao")({
  component: Automacao,
});

type LogRow = {
  id: string;
  status: string;
  provider: string;
  external_id: string | null;
  message: string | null;
  mock: boolean;
  created_at: string;
};

function Automacao() {
  const qc = useQueryClient();

  const { data: health, isError: healthErr } = useQuery({
    queryKey: ["server-health"],
    queryFn: async () => {
      const r = await fetch(`/health`);
      if (!r.ok) throw new Error("Backend offline");
      return r.json() as Promise<{ mock: boolean; cron: string; time: string }>;
    },
    refetchInterval: 15000,
    retry: false,
  });

  const { data: logs } = useQuery({
    queryKey: ["publish-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publish_log")
        .select("id,status,provider,external_id,message,mock,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
    refetchInterval: 10000,
  });

  const runNow = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/scheduler/run`, { method: "POST" });
      if (!r.ok) throw new Error("Falha ao chamar o scheduler");
      return r.json() as Promise<{ processed: number; published: number; failed: number }>;
    },
    onSuccess: (s) => {
      toast.success(`Scheduler: ${s.processed} processado(s), ${s.published} publicado(s), ${s.failed} falha(s)`);
      qc.invalidateQueries({ queryKey: ["publish-log"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Automação"
        description="Status do publicador automático e histórico de publicações."
        action={
          <Button onClick={() => runNow.mutate()} disabled={runNow.isPending}>
            {runNow.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Testar publicação agora
          </Button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" /> Backend
          </div>
          <div className="mt-2 text-lg font-semibold">
            {healthErr ? <span className="text-destructive">Offline</span> : <span className="text-success">Online</span>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Modo de publicação</div>
          <div className="mt-2 text-lg font-semibold">
            {health?.mock ? "Mock (simulada)" : "Real"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Agendador (cron)</div>
          <div className="mt-2 font-mono text-lg font-semibold">{health?.cron ?? "—"}</div>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Histórico de publicações</h2>
      <Card className="divide-y divide-border">
        {(logs ?? []).map((l) => (
          <div key={l.id} className="flex items-center gap-3 p-4 text-sm">
            {l.status === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate">{l.message || l.status}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(l.created_at).toLocaleString("pt-BR")}
                {l.external_id ? ` · id: ${l.external_id}` : ""}
              </div>
            </div>
            {l.mock && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">mock</span>}
          </div>
        ))}
        {(!logs || logs.length === 0) && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhuma publicação ainda. Agende um post e clique em "Testar publicação agora".
          </div>
        )}
      </Card>
    </div>
  );
}
