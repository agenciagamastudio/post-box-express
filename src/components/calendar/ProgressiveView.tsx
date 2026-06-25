import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, ImageIcon } from "lucide-react";
import { getStatusInfo, getDotColor } from "./postStatus";

export type ProgressivePost = {
  id: string;
  title: string;
  scheduled_at: string | null;
  network: string;
  client_id?: string;
  clients?: { name?: string; color?: string };
  cover_url?: string | null;
  status: string;
  format?: string;
};

type ProgressiveViewProps<T extends ProgressivePost> = {
  posts: T[] | undefined;
  onPostClick: (post: T) => void;
  filters: { clients: string[]; networks: string[] };
};

type DayGroup<T extends ProgressivePost> = {
  key: string;
  date: Date;
  posts: T[];
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function StatusDot({ status }: { status: string }) {
  const info = getStatusInfo(status);
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${getDotColor(info.dot)}`}
      title={info.label}
    />
  );
}

function PostCard<T extends ProgressivePost>({
  post,
  onClick,
}: {
  post: T;
  onClick: (post: T) => void;
}) {
  const info = getStatusInfo(post.status);
  const clientColor = post.clients?.color ?? "#A78BFA";

  return (
    <button
      type="button"
      onClick={() => onClick(post)}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-2 text-left transition hover:bg-accent/50"
    >
      {/* Thumbnail */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {post.cover_url ? (
          <img src={post.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Título + meta */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{post.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: clientColor }} />
          <span className="truncate">{post.clients?.name ?? "Sem cliente"}</span>
          <span>·</span>
          <span className="truncate capitalize">{post.network}</span>
          {post.scheduled_at && (
            <>
              <span>·</span>
              <span>
                {new Date(post.scheduled_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusDot status={post.status} />
        <span
          className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline ${info.cls}`}
        >
          {info.label}
        </span>
      </div>
    </button>
  );
}

export function ProgressiveView<T extends ProgressivePost>({
  posts,
  onPostClick,
  filters,
}: ProgressiveViewProps<T>) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const groups = useMemo<DayGroup<T>[]>(() => {
    if (!posts) return [];

    const filtered = posts.filter((p) => {
      if (filters.networks.length > 0 && !filters.networks.includes(p.network)) return false;
      if (filters.clients.length > 0) {
        if (!p.client_id || !filters.clients.includes(p.client_id)) return false;
      }
      return p.scheduled_at != null;
    });

    const map = new Map<string, DayGroup<T>>();
    for (const p of filtered) {
      const d = new Date(p.scheduled_at as string);
      const key = dayKey(d);
      if (!map.has(key)) {
        map.set(key, {
          key,
          date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          posts: [],
        });
      }
      map.get(key)!.posts.push(p);
    }

    const result = Array.from(map.values());
    result.sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const g of result) {
      g.posts.sort((a, b) => {
        const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0;
        const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0;
        return ta - tb;
      });
    }
    return result;
  }, [posts, filters]);

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  if (groups.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Nenhum post agendado para este período.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const isOpen = expanded[g.key] ?? false;
        const dateLabel = g.date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        });
        return (
          <Card key={g.key} className="overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(g.key)}
              className="flex w-full items-center justify-between p-3 text-left transition hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium capitalize">{dateLabel}</span>
              </div>
              <Badge variant="secondary">
                {g.posts.length} {g.posts.length === 1 ? "post" : "posts"}
              </Badge>
            </button>

            {isOpen && (
              <div className="space-y-2 border-t border-border p-3">
                {g.posts.map((p) => (
                  <PostCard key={p.id} post={p} onClick={onPostClick} />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
