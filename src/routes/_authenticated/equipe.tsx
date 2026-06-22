import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/equipe")({ component: Team });

function Team() {
  const { data: members } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url");
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id,role");
      return profiles.map((p) => ({
        ...p,
        roles: roles?.filter((r) => r.user_id === p.id).map((r) => r.role) ?? [],
      }));
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Equipe" description="Quem trabalha com você no GamaGit." />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {members?.map((m) => (
          <Card key={m.id} className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
              {(m.full_name ?? "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{m.full_name ?? "Sem nome"}</div>
              <div className="text-xs text-muted-foreground">{m.roles.join(", ") || "membro"}</div>
            </div>
          </Card>
        ))}
        {(!members || members.length === 0) && (
          <div className="col-span-full text-sm text-muted-foreground">
            Apenas você por enquanto. Convites por e-mail em breve.
          </div>
        )}
      </div>
    </div>
  );
}
