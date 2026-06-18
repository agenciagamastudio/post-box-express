import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/calendario")({
  component: Cal,
});

function Cal() {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const { data: posts } = useQuery({
    queryKey: ["posts-cal", cursor.getFullYear(), cursor.getMonth()],
    queryFn: async () => {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const { data, error } = await supabase
        .from("posts").select("id,title,scheduled_at,network,clients(name,color)")
        .gte("scheduled_at", start.toISOString()).lt("scheduled_at", end.toISOString());
      if (error) throw error;
      return data;
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

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Calendário"
        description="Visão mensal dos posts agendados."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-[150px] text-center font-medium capitalize">{monthLabel}</span>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />
      <Card className="mt-6 p-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => <div key={d} className="p-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const dayPosts = d ? (posts ?? []).filter((p) => p.scheduled_at && new Date(p.scheduled_at).getDate() === d.getDate()) : [];
            return (
              <div key={i} className={`min-h-[100px] rounded-lg border border-border p-2 text-left text-xs ${d ? "bg-card" : "bg-muted/30"}`}>
                {d && <div className="font-semibold">{d.getDate()}</div>}
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 3).map((p) => (
                    <div key={p.id} className="truncate rounded px-1 py-0.5" style={{ background: `${(p.clients as any)?.color ?? "#A78BFA"}22`, color: (p.clients as any)?.color }}>
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
    </div>
  );
}
