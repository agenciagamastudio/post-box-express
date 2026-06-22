import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";

export type Post = {
  id: string;
  title: string;
  scheduled_at: string | null;
  network: string;
  clients?: { name?: string; color?: string };
};

type WeekViewProps = {
  cursor: Date;
  setCursor: (d: Date) => void;
  posts: Post[] | undefined;
  onPostClick: (post: Post) => void;
  onDayClick: (date: Date) => void;
  filters: { clients: string[]; networks: string[] };
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function DraggablePost({ post, onPostClick }: { post: Post; onPostClick: (post: Post) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onPostClick(post);
      }}
      className="cursor-grab active:cursor-grabbing truncate rounded px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80"
      style={{
        background: `${(post.clients as any)?.color ?? "#A78BFA"}22`,
        color: (post.clients as any)?.color,
      }}
    >
      {post.title}
    </div>
  );
}

function DayColumn({
  date,
  posts: dayPosts,
  onPostClick,
  onDayClick,
}: {
  date: Date;
  posts: Post[];
  onPostClick: (post: Post) => void;
  onDayClick: (date: Date) => void;
}) {
  return (
    <div className="flex-1 border-l border-border">
      <div
        className="border-b border-border bg-card p-3 text-center font-semibold cursor-pointer hover:bg-accent/50 transition"
        onClick={() => onDayClick(date)}
      >
        <div className="text-sm">{date.toLocaleDateString("pt-BR", { weekday: "short" })}</div>
        <div className="text-lg">{date.getDate()}</div>
      </div>
      <div className="relative min-h-[1200px]">
        {HOURS.map((hour) => (
          <div key={hour} className="relative border-b border-border/50 h-12 flex">
            <div className="flex-1 p-1 space-y-0.5">
              {dayPosts
                .filter((p) => {
                  if (!p.scheduled_at) return false;
                  const pHour = new Date(p.scheduled_at).getHours();
                  return pHour === hour;
                })
                .map((p) => (
                  <DraggablePost key={p.id} post={p} onPostClick={onPostClick} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeekView({
  cursor,
  setCursor,
  posts: allPosts,
  onPostClick,
  onDayClick,
  filters,
}: WeekViewProps) {
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const weekStart = useMemo(() => {
    const d = new Date(cursor);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }, [cursor]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const filteredPosts = useMemo(() => {
    if (!allPosts) return [];
    return allPosts.filter((p) => {
      if (filters.networks.length > 0 && !filters.networks.includes(p.network)) {
        return false;
      }
      if (filters.clients.length > 0) {
        const clientId = (p as any).client_id;
        if (!filters.clients.includes(clientId)) return false;
      }
      return true;
    });
  }, [allPosts, filters]);

  const updatePost = useMutation({
    mutationFn: async ({ postId, newDate }: { postId: string; newDate: Date }) => {
      const { error } = await supabase
        .from("posts")
        .update({ scheduled_at: newDate.toISOString() })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post reagendado");
      qc.invalidateQueries({ queryKey: ["posts-cal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    // Implementar drag-and-drop logic aqui
  };

  const weekLabel = `${weekDays[0].toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })} - ${weekDays[6].toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCursor(
              new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7),
            )
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[200px] text-center font-medium">{weekLabel}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCursor(
              new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7),
            )
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex border-t border-border">
            {/* Time labels */}
            <div className="w-12 border-r border-border bg-muted/30 flex flex-col">
              <div className="h-[120px] border-b border-border" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-border/50 flex items-start justify-center text-xs text-muted-foreground font-medium"
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Days */}
            {weekDays.map((day) => (
              <DayColumn
                key={day.toISOString()}
                date={day}
                posts={filteredPosts.filter((p) => {
                  if (!p.scheduled_at) return false;
                  const pDate = new Date(p.scheduled_at);
                  return pDate.toDateString() === day.toDateString();
                })}
                onPostClick={onPostClick}
                onDayClick={onDayClick}
              />
            ))}
          </div>
        </DndContext>
      </Card>
    </div>
  );
}
