import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { ClientProvider } from "@/contexts/ClientContext";
import { PeriodProvider } from "@/contexts/PeriodContext";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <ClientProvider>
      <PeriodProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </PeriodProvider>
    </ClientProvider>
  ),
});
