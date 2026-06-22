import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { PostDialog } from "@/components/app/PostDialog";
import { EditPostModal } from "@/components/posts/EditPostModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle2, Clock, AlertTriangle, X } from "lucide-react";
import { useViewPreferences } from "@/contexts/ViewPreferencesContext";

export const Route = createFileRoute("/_authenticated/feed")({
  component: FeedPage,
});

type FeedPost = {
  id: string;
  title: string | null;
  caption: string | null;
  cover_url: string | null;
  status: string;
  network: string | null;
  format: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  client_id: string | null;
  clients: { name: string | null; color: string | null } | null;
};

const ALL_CLIENTS = "__all__";

// Configuração visual por status.
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  publicado: {
    label: "Publicado",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  agendado: {
    label: "Agendado",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  erro: {
    label: "Erro",
    className: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
    icon: AlertTriangle,
  },
};

const DEFAULT_STATUS = {
  label: "Pendente",
  className: "border-border bg-muted text-muted-foreground",
  icon: Clock,
};

function statusInfo(status: string) {
  return STATUS_CONFIG[status] ?? { ...DEFAULT_STATUS, label: status };
}

// Ordenação: próximos (agendados, por data ascendente) antes de publicados (data descendente).
function sortPosts(a: FeedPost, b: FeedPost) {
  const aPublished = a.status === "publicado";
  const bPublished = b.status === "publicado";
  if (aPublished !== bPublished) return aPublished ? 1 : -1;

  if (!aPublished) {
    const aDate = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity;
    const bDate = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity;
    return aDate - bDate;
  }

  const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
  const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
  return bDate - aDate;
}

function formatDate(iso: string | null) {
  if (!iso) return "Sem data";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeedPage() {
  const { editMode } = useViewPreferences();
  const [clientFilter, setClientFilter] = useState<string>(ALL_CLIENTS);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Estados para inline/sidebar
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarEditId, setSidebarEditId] = useState<string | null>(null);

  const { data: clients } = useQuery({
    queryKey: ["feed-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id,title,caption,cover_url,status,network,format,scheduled_at,published_at,client_id,clients(name,color)",
        )
        .in("status", ["agendado", "publicado"]);
      if (error) throw error;
      return data as FeedPost[];
    },
  });

  const visible = useMemo(() => {
    const list = (posts ?? []).filter((p) =>
      clientFilter === ALL_CLIENTS ? true : p.client_id === clientFilter,
    );
    return [...list].sort(sortPosts);
  }, [posts, clientFilter]);

  const openEdit = (id: string) => {
    if (editMode === "modal") {
      setEditId(id);
      setDialogOpen(true);
    } else if (editMode === "inline") {
      setInlineEditId(id);
    } else if (editMode === "sidebar") {
      setSidebarEditId(id);
      setSidebarOpen(true);
    }
  };

  // Post sendo editado em modo inline
  const inlinePost = inlineEditId ? visible.find((p) => p.id === inlineEditId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feed de Posts"
        description="Posts agendados e publicados, ordenados por proximidade."
        action={
          <div className="w-56">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CLIENTS}>Todos os clientes</SelectItem>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name ?? "Sem nome"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">Carregando posts...</Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Nenhum post encontrado para este filtro.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => {
            const info = statusInfo(post.status);
            const StatusIcon = info.icon;
            const date = post.status === "publicado" ? post.published_at : post.scheduled_at;
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => openEdit(post.id)}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {post.cover_url ? (
                    <img
                      src={post.cover_url}
                      alt={post.title ?? "Post"}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Calendar className="h-8 w-8" />
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium backdrop-blur ${info.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {info.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-1 font-medium">{post.title ?? "Sem título"}</h3>
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {post.clients?.color && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: post.clients.color }}
                        />
                      )}
                      {post.clients?.name ?? "Sem cliente"}
                    </span>
                    <span>{formatDate(date)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modo Inline */}
      {editMode === "inline" && inlinePost && inlineEditId && (
        <Card className="mt-6 p-6 border-primary/50 bg-primary/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Editando: {inlinePost.title}</h3>
            <Button variant="ghost" size="icon" onClick={() => setInlineEditId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <EditPostModal
            postId={inlineEditId}
            open={!!inlineEditId}
            onOpenChange={() => setInlineEditId(null)}
            onSaved={() => {
              setInlineEditId(null);
            }}
          />
        </Card>
      )}

      {/* Modo Modal (padrão) */}
      {editMode === "modal" && (
        <PostDialog open={dialogOpen} onOpenChange={setDialogOpen} postId={editId} />
      )}

      {/* Modo Sidebar */}
      {editMode === "sidebar" && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-full sm:w-[450px]">
            <SheetHeader>
              <SheetTitle>Editar Post</SheetTitle>
            </SheetHeader>
            {sidebarEditId && (
              <div className="mt-4">
                <EditPostModal
                  postId={sidebarEditId}
                  open={sidebarOpen}
                  onOpenChange={setSidebarOpen}
                  onSaved={() => {
                    setSidebarOpen(false);
                    setSidebarEditId(null);
                  }}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
