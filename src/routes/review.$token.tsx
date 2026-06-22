import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/app/Logo";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/review/$token")({
  component: Review,
});

type Data = {
  review: { status: string; comment: string | null; reviewer_name: string | null };
  post: {
    title: string;
    caption: string | null;
    cover_url: string | null;
    status: string;
    format: string;
    network: string;
    client_name: string | null;
  } | null;
};

function Review() {
  const { token } = Route.useParams();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | "approved" | "changes">(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/review/${token}`);
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

  const decide = async (decision: "approved" | "changes") => {
    if (decision === "changes" && !comment.trim()) {
      alert("Descreva o que precisa ajustar.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch(`/api/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment, reviewer_name: name }),
      });
      if (!r.ok) throw new Error("Falha ao enviar");
      setDone(decision);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error || !data?.post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-foreground">{error || "Post não encontrado."}</p>
      </div>
    );
  }

  const post = data.post;
  const alreadyDecided = data.review.status !== "pending";
  const finished =
    done || (alreadyDecided ? (data.review.status === "approved" ? "approved" : "changes") : null);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="sm" />
          {post.client_name && (
            <span className="text-sm text-muted-foreground">{post.client_name}</span>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {post.cover_url && (
            <img
              src={post.cover_url}
              alt={post.title}
              className="aspect-square w-full object-cover"
            />
          )}
          <div className="space-y-3 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {post.network} · {post.format}
            </div>
            <h1 className="font-display text-xl font-semibold">{post.title}</h1>
            {post.caption && (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{post.caption}</p>
            )}
          </div>
        </div>

        {finished ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
            {finished === "approved" ? (
              <>
                <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
                <p className="mt-3 font-semibold">Post aprovado! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  Obrigado — sua aprovação foi registrada.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto h-10 w-10 text-warning" />
                <p className="mt-3 font-semibold">Ajuste solicitado</p>
                <p className="text-sm text-muted-foreground">
                  Recebemos seu feedback. A equipe vai revisar.
                </p>
                {data.review.comment && (
                  <p className="mt-2 rounded-lg bg-muted/40 p-2 text-sm">"{data.review.comment}"</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <Input
              placeholder="Seu nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Comentário / o que ajustar (obrigatório se pedir ajuste)"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => decide("approved")} disabled={sending}>
                {sending ? (
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
                disabled={sending}
              >
                Pedir ajuste
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Você está revisando este conteúdo a convite da agência.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
