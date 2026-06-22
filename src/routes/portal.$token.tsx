import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/app/Logo";
import { AlertCircle, Loader2, CalendarDays, ListChecks, CheckCircle2, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/$token")({
  component: Portal,
});

type Post = {
  id: string;
  title: string;
  caption?: string | null;
  status: string;
  network: string;
  format: string;
  scheduled_at: string | null;
  published_at: string | null;
  cover_url: string | null;
};
type Data = { client: { name: string; handle: string | null } | null; posts: Post[] };

const STATUS: Record<string, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
  aprovacao: { label: "Em aprovação", cls: "bg-warning/15 text-warning" },
  ajuste: { label: "Ajuste", cls: "bg-destructive/15 text-destructive" },
  aprovado: { label: "Aprovado", cls: "bg-info/15 text-info" },
  agendado: { label: "Agendado", cls: "bg-primary/15 text-primary" },
  publicado: { label: "Publicado", cls: "bg-success/15 text-success" },
};

function Badge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function fmtDate(iso: string | null) {
  if (!iso) return "Sem data";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Portal() {
  const { token } = Route.useParams();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const load = async () => {
    try {
      const r = await fetch(`/api/portal/${token}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Link inválido");
      }
      setData(await r.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-foreground">{error || "Portal não encontrado."}</p>
      </div>
    );
  }

  const posts = data.posts;
  const pending = posts.filter((p) => p.status === "aprovacao");

  const dated = [...posts]
    .map((p) => ({ ...p, when: p.scheduled_at || p.published_at }))
    .filter((p) => p.when)
    .sort((a, b) => (a.when! < b.when! ? -1 : 1));
  const groups = new Map<string, typeof dated>();
  for (const p of dated) {
    const key = fmtDate(p.when);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="sm" />
          <div className="text-right">
            <div className="font-semibold">{data.client?.name}</div>
            {data.client?.handle && (
              <div className="text-xs text-muted-foreground">{data.client.handle}</div>
            )}
          </div>
        </div>

        <h1 className="mb-1 font-display text-2xl font-semibold">Portal de conteúdos</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Aprove, acompanhe o calendário e o status dos seus posts.
        </p>

        <Tabs defaultValue={pending.length ? "aprovar" : "status"}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aprovar">
              <Inbox className="mr-1 h-4 w-4" />
              Aprovar{pending.length ? ` (${pending.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="status">
              <ListChecks className="mr-1 h-4 w-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="cal">
              <CalendarDays className="mr-1 h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          {/* APROVAR */}
          <TabsContent value="aprovar" className="mt-4 space-y-3">
            <Input
              placeholder="Seu nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {pending.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
                Nada pendente de aprovação. 🎉
              </div>
            )}
            {pending.map((p) => (
              <ApprovalItem key={p.id} post={p} token={token} reviewerName={name} onDone={load} />
            ))}
          </TabsContent>

          {/* STATUS */}
          <TabsContent value="status" className="mt-4 space-y-2">
            {posts.length === 0 && <Empty />}
            {posts.map((p) => (
              <Card key={p.id} className="flex items-center gap-3 p-3">
                {p.cover_url ? (
                  <img
                    src={p.cover_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.network} · {p.format}
                    {p.scheduled_at ? ` · ${fmtDate(p.scheduled_at)}` : ""}
                  </div>
                </div>
                <Badge status={p.status} />
              </Card>
            ))}
          </TabsContent>

          {/* CALENDÁRIO */}
          <TabsContent value="cal" className="mt-4 space-y-5">
            {groups.size === 0 && <Empty msg="Nenhum post com data ainda." />}
            {[...groups.entries()].map(([date, list]) => (
              <div key={date}>
                <div className="mb-2 text-sm font-semibold text-primary">{date}</div>
                <div className="space-y-2">
                  {list.map((p) => (
                    <Card key={p.id} className="flex items-center gap-3 p-3">
                      {p.cover_url ? (
                        <img
                          src={p.cover_url}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.network} · {p.format}
                        </div>
                      </div>
                      <Badge status={p.status} />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ApprovalItem({
  post,
  token,
  reviewerName,
  onDone,
}: {
  post: Post;
  token: string;
  reviewerName: string;
  onDone: () => void;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const decide = async (decision: "approved" | "changes") => {
    if (decision === "changes" && !comment.trim()) {
      toast.error("Descreva o que precisa ajustar.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/portal/${token}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, decision, comment, reviewer_name: reviewerName }),
      });
      if (!r.ok) throw new Error("Falha ao enviar");
      toast.success(decision === "approved" ? "Post aprovado!" : "Ajuste solicitado");
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex gap-3">
        {post.cover_url ? (
          <img src={post.cover_url} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium">{post.title}</div>
          <div className="text-xs text-muted-foreground">
            {post.network} · {post.format}
          </div>
          {post.caption && (
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{post.caption}</p>
          )}
        </div>
      </div>
      <Textarea
        placeholder="Comentário / o que ajustar (obrigatório se pedir ajuste)"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => decide("approved")} disabled={busy}>
          {busy ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-1 h-4 w-4" />
          )}
          Aprovar
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => decide("changes")}
          disabled={busy}
        >
          Pedir ajuste
        </Button>
      </div>
    </Card>
  );
}

function Empty({ msg = "Nenhum conteúdo ainda." }: { msg?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {msg}
    </div>
  );
}
