import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Instagram,
  Facebook,
  MapPin,
  Copy,
  Unplug,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/integracoes/$clientId")({
  component: Integracoes,
});

type Conn = { id: string; client_id: string; ig_username: string | null; status: string };
type LogRow = {
  id: string;
  status: string;
  external_id: string | null;
  message: string | null;
  mock: boolean;
  created_at: string;
};

function Integracoes() {
  const { clientId } = Route.useParams();
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: client } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,handle")
        .eq("id", clientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: conn } = useQuery({
    queryKey: ["ig-connection", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_connections")
        .select("id,client_id,ig_username,status")
        .eq("client_id", clientId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Conn | null;
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["publish-log", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publish_log")
        .select("id,status,external_id,message,mock,created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
  });

  const connected = conn?.status === "connected";
  const connectLink = `${window.location.origin}/auth/instagram/start?client_id=${clientId}`;

  const disconnect = useMutation({
    mutationFn: async () => {
      if (!conn) return;
      const { error } = await supabase.from("instagram_connections").delete().eq("id", conn.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Instagram desconectado");
      qc.invalidateQueries({ queryKey: ["ig-connection", clientId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(connectLink);
      toast.success("Link copiado — envie para o cliente conectar");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const portalLink = async () => {
    // Gera (ou reaproveita) o link do portal do cliente (calendário + status).
    const { data, error } = await supabase
      .from("client_portal_links")
      .upsert({ client_id: clientId }, { onConflict: "client_id" })
      .select("token")
      .single();
    if (error) return toast.error(error.message);
    const url = `${window.location.origin}/portal/${data.token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link do portal copiado — envie para o cliente");
    } catch {
      toast.success(url);
    }
  };

  const filteredLogs = (logs ?? []).filter(
    (l) => !search || (l.message ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8">
      <Link
        to="/clientes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Link>
      <PageHeader
        title="Integrações"
        description={`Gerencie as conexões com redes sociais de ${client?.name ?? "este cliente"}.`}
      />

      {/* Gerar link para cliente conectar */}
      <Card className="mt-6 p-5">
        <div className="text-sm font-medium">Gerar link para o cliente conectar</div>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">
          Envie este link para o cliente abrir, fazer login no Instagram dele e autorizar — sem
          precisar da senha dele.
        </p>
        <div className="flex gap-2">
          <Input readOnly value={connectLink} className="font-mono text-xs" />
          <Button variant="outline" onClick={copyLink}>
            <Copy className="mr-1 h-4 w-4" />
            Copiar
          </Button>
        </div>
      </Card>

      {/* Portal do cliente: calendário + status */}
      <Card className="mt-3 p-5">
        <div className="text-sm font-medium">Portal do cliente (calendário + status)</div>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">
          Link somente-leitura para o cliente acompanhar o calendário e o status dos conteúdos.
        </p>
        <Button variant="outline" onClick={portalLink}>
          <Copy className="mr-1 h-4 w-4" />
          Gerar e copiar link do portal
        </Button>
      </Card>

      {/* Plataformas */}
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {/* Instagram (ativo) */}
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-primary" />
            <span className="font-medium">Via Instagram</span>
          </div>
          <span className={`text-xs ${connected ? "text-success" : "text-muted-foreground"}`}>
            {connected ? `Conectado ${conn?.ig_username ?? ""}` : "Não conectado"}
          </span>
          {connected ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Unplug className="mr-1 h-4 w-4" />
              )}
              Desconectar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => setConfirmOpen(true)}
            >
              <Instagram className="mr-1 h-4 w-4" />
              Integrar
            </Button>
          )}
        </Card>

        {/* Facebook (em breve) */}
        <Card className="flex flex-col gap-3 p-5 opacity-70">
          <div className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Via Facebook</span>
          </div>
          <span className="text-xs text-muted-foreground">Não conectado</span>
          <Button variant="outline" size="sm" className="justify-start" disabled>
            Em breve
          </Button>
        </Card>

        {/* Google Meu Negócio (em breve) */}
        <Card className="flex flex-col gap-3 p-5 opacity-70">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Google Meu Negócio</span>
          </div>
          <span className="text-xs text-muted-foreground">Não conectado</span>
          <Button variant="outline" size="sm" className="justify-start" disabled>
            Em breve
          </Button>
        </Card>
      </div>

      {/* Histórico */}
      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">
        Histórico de conexões e publicações
      </h2>
      <div className="mb-3 max-w-xs">
        <Input
          placeholder="Buscar no histórico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Card className="divide-y divide-border">
        {filteredLogs.map((l) => (
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
            {l.mock && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                mock
              </span>
            )}
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado em todo o histórico.
          </div>
        )}
      </Card>

      {/* Confirmação Instagram */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-primary" /> Conectar o Instagram
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Você será redirecionado para o Instagram. Faça login com a conta que será gerenciada e
              autorize a conexão para voltar ao GamaGit.
            </p>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="mb-1 font-medium">Limitações desta conexão</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>Não permite convidar coautores (collab posts).</li>
                <li>Não permite marcar localização nas publicações.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                window.location.href = connectLink;
              }}
            >
              <Instagram className="mr-1 h-4 w-4" />
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
