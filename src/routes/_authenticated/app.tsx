import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/app/PageHeader";
import { CalendarClock, CheckCircle2, FileEdit, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  component: Dashboard,
});

function Dashboard() {
  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("status");
      if (error) throw error;
      const c = { rascunho: 0, aprovacao: 0, ajuste: 0, aprovado: 0, agendado: 0, publicado: 0 };
      data.forEach((p) => { c[p.status as keyof typeof c]++; });
      return c;
    },
  });

  const { data: upcoming } = useQuery({
    queryKey: ["upcoming-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,scheduled_at,network,clients(name,color)")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const cards = [
    { label: "Rascunhos", value: counts?.rascunho ?? 0, icon: FileEdit, color: "text-muted-foreground" },
    { label: "Em aprovação", value: counts?.aprovacao ?? 0, icon: Clock, color: "text-warning" },
    { label: "Aprovados", value: counts?.aprovado ?? 0, icon: CheckCircle2, color: "text-success" },
    { label: "Agendados", value: counts?.agendado ?? 0, icon: CalendarClock, color: "text-primary" },
  ];

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Visão geral" description="Acompanhe sua agenda de conteúdo." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">{c.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">Próximos agendamentos</h2>
        <Card className="mt-3 divide-y divide-border">
          {upcoming && upcoming.length > 0 ? upcoming.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: (p.clients as any)?.color ?? "#A78BFA" }} />
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{(p.clients as any)?.name} • {p.network}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {p.scheduled_at && new Date(p.scheduled_at).toLocaleString("pt-BR")}
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhum post agendado. Crie seu primeiro post no Kanban.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
