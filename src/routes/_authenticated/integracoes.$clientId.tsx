import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
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
import { useState, useEffect } from "react";
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
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Detectar conexão bem-sucedida via query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const igStatus = params.get("ig");

    if (igStatus === "connected") {
      toast.success("✓ Instagram conectado com sucesso!");
      qc.invalidateQueries({ queryKey: ["ig-connection", clientId] });
      // Remover o param da URL
      navigate({ to: `/integracoes/${clientId}`, replace: true });
    } else if (igStatus === "error") {
      const msg = params.get("msg");
      toast.error(`Erro ao conectar: ${msg || "Tente novamente"}`);
    }
  }, [clientId, qc, navigate]);

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

  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shortLink, setShortLink] = useState<string | null>(null);

  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    // Redireciona para rota do backend (OAuth no servidor, seguro)
    window.location.href = `/oauth/instagram/start?client_id=${clientId}`;
  };

  const generateShortLink = async () => {
    try {
      setIsGeneratingLink(true);
      const res = await fetch("/api/instagram/auth-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      if (!res.ok) throw new Error("Falha ao gerar link curto");
      const { short_url } = await res.json();
      setShortLink(short_url);
      try {
        await navigator.clipboard.writeText(short_url);
        toast.success("Link curto copiado!");
      } catch {
        toast.success(`Link gerado: ${short_url}`);
      }
    } catch (err) {
      toast.error("Erro ao gerar link curto");
    } finally {
      setIsGeneratingLink(false);
    }
  };

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

  const portalLink = async () => {
    try {
      const res = await fetch("/api/client-portal-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      if (!res.ok) throw new Error("Falha ao gerar link");
      const { url } = await res.json();
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link do portal copiado — envie para o cliente");
      } catch {
        toast.success(`Link: ${url}`);
      }
    } catch (err) {
      toast.error("Erro ao gerar link do portal");
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

      {/* Card: Link curto para compartilhar */}
      {connected && (
        <Card className="mt-6 p-5 border-primary/30 bg-primary/5">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Compartilhar com cliente</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Gere um link curto para enviar via WhatsApp ou email
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateShortLink}
              disabled={isGeneratingLink}
              className="w-full"
            >
              {isGeneratingLink ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Gerando link...
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Gerar link curto
                </>
              )}
            </Button>
            {shortLink && (
              <div className="rounded-lg bg-muted px-3 py-2 text-xs font-mono text-muted-foreground break-all">
                {shortLink}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Plataformas */}
      <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* Instagram (ativo) */}
        <Card
          className={`flex flex-col gap-4 p-6 ${
            connected
              ? "border-success/50 bg-success/5"
              : "border-primary/30 bg-primary/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Instagram className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Instagram</div>
                <div
                  className={`text-xs font-medium ${
                    connected ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {connected ? `✓ Conectado` : "Não conectado"}
                </div>
              </div>
            </div>
            {connected && (
              <CheckCircle2 className="h-5 w-5 text-success" />
            )}
          </div>

          {connected && (
            <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
              <div className="font-medium text-muted-foreground">Conta conectada</div>
              <div className="text-foreground font-medium">{conn?.ig_username ?? "Instagram"}</div>
            </div>
          )}

          {connected ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
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
              size="lg"
              className="w-full"
              onClick={() => setConfirmOpen(true)}
            >
              <Instagram className="mr-2 h-4 w-4" />
              Conectar Agora
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Instagram className="h-5 w-5 text-primary" />
              Conectar conta do Instagram
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Você será redirecionado para o Instagram para autorizar a conexão com segurança.
              Não precisamos da sua senha.
            </p>

            <div className="space-y-2 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="font-medium text-primary">O que isso permite:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary/70">✓</span>
                  <span>Publicar posts no seu feed do Instagram</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary/70">✓</span>
                  <span>Gerenciar calendário de publicações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary/70">✓</span>
                  <span>Visualizar insights e engajamento</span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConnectInstagram}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <Instagram className="mr-1 h-4 w-4" />
                  Autorizar no Instagram
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
