import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostDialog } from "@/components/app/PostDialog";
import { PostDetailDialog, DetailPost } from "@/components/app/PostDetailDialog";
import { WeekView } from "@/components/calendar/WeekView";
import { CalendarFiltersPanel } from "@/components/calendar/CalendarFilters";
import { QuickFilters } from "@/components/calendar/QuickFilters";
import { useCalendarFilters } from "@/hooks/useCalendarFilters";

export const Route = createFileRoute("/_authenticated/calendario")({
  component: Cal,
});

type Post = {
  id: string;
  title: string;
  scheduled_at: string | null;
  network: string;
  client_id?: string;
  clients?: { name?: string; color?: string };
  caption?: string | null;
  cover_url?: string | null;
  status: string;
  format: string;
  published_at?: string | null;
  post_reviews?: Array<{ comment: string | null; status: string; reviewer_name: string | null; created_at: string }>;
};

function Cal() {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [view, setView] = useState<"month" | "week">("month");

  // Usar hook de filtros com persistência em localStorage
  const {
    filters,
    toggleClient,
    toggleNetwork,
    setOnlyClient,
    clearFilters,
    hasActiveFilters,
  } = useCalendarFilters();

  const [selectedPost, setSelectedPost] = useState<DetailPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);

  const getDateRange = () => {
    if (view === "month") {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      return { start, end };
    } else {
      const weekStart = new Date(cursor);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - day);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return { start: weekStart, end: weekEnd };
    }
  };

  const { start, end } = getDateRange();

  const { data: posts } = useQuery({
    queryKey: ["posts-cal", start.toISOString(), end.toISOString(), view],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,scheduled_at,network,client_id,clients(name,color),caption,cover_url,status,format,published_at,post_reviews(comment,status,reviewer_name,created_at)")
        .gte("scheduled_at", start.toISOString())
        .lt("scheduled_at", end.toISOString());
      if (error) throw error;
      return data as Post[];
    },
  });

  const days = useMemo(() => {
    const first = new Date(cursor);
    const startDay = first.getDay();
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= total; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    return cells;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const handlePostClick = (post: Post) => {
    setSelectedPost(post as DetailPost);
    setIsDetailOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setCreateDate(date);
    setEditPostId(null);
    setIsCreateOpen(true);
  };

  const handleEditPost = (id: string) => {
    setEditPostId(id);
    setIsDetailOpen(false);
    setIsCreateOpen(true);
  };

  const handleResendPost = (id: string) => {
    // TODO: implementar reenvio para aprovação
  };

  const handleApprovalLink = (id: string) => {
    // TODO: implementar geração de link de aprovação
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <PageHeader
          title="Calendário"
          description="Visualize e gerencie todos os seus posts agendados."
        />

        {/* Quick Filters na Top Bar */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Filtros aplicados:</span>
              <QuickFilters
                filters={filters}
                toggleClient={toggleClient}
                setOnlyClient={setOnlyClient}
                clearFilters={clearFilters}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="min-w-[150px] text-center font-medium capitalize">{monthLabel}</span>
                <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <Card className="p-2">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                  {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => <div key={d} className="p-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, i) => {
                    const dayPosts = d ? (posts ?? []).filter((p) => p.scheduled_at && new Date(p.scheduled_at).getDate() === d.getDate()) : [];
                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] rounded-lg border border-border p-2 text-left text-xs cursor-pointer hover:bg-accent/50 transition ${d ? "bg-card" : "bg-muted/30"}`}
                        onClick={() => d && handleDayClick(d)}
                      >
                        {d && <div className="font-semibold">{d.getDate()}</div>}
                        <div className="mt-1 space-y-1">
                          {dayPosts.slice(0, 3).map((p) => (
                            <div
                              key={p.id}
                              className="truncate rounded px-1 py-0.5 cursor-pointer hover:opacity-80"
                              style={{ background: `${(p.clients as any)?.color ?? "#A78BFA"}22`, color: (p.clients as any)?.color }}
                              onClick={(e) => { e.stopPropagation(); handlePostClick(p); }}
                            >
                              {p.title}
                            </div>
                          ))}
                          {dayPosts.length > 3 && <div className="text-muted-foreground">+{dayPosts.length - 3}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="week">
              <WeekView
                cursor={cursor}
                setCursor={setCursor}
                posts={posts}
                onPostClick={handlePostClick}
                onDayClick={handleDayClick}
                filters={{ clients: filters.clients, networks: filters.networks }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar de filtros */}
        <div className="md:sticky md:top-6 h-fit">
          <CalendarFiltersPanel
            filters={filters}
            toggleClient={toggleClient}
            toggleNetwork={toggleNetwork}
            setOnlyClient={setOnlyClient}
            clearFilters={clearFilters}
          />
        </div>
      </div>

      {/* Dialogs */}
      <PostDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} postId={editPostId} />
      <PostDetailDialog
        post={selectedPost}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEditPost}
        onResend={handleResendPost}
        onApprovalLink={handleApprovalLink}
      />
    </div>
  );
}
