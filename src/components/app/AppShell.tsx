import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Users,
  Building2,
  ListChecks,
  Wallet,
  LogOut,
  Settings,
  Zap,
  BarChart3,
} from "lucide-react";
import { Logo } from "./Logo";
import { GlobalClientSelector } from "./GlobalClientSelector";
import { NotificationsBell } from "./NotificationsBell";
import { PeriodSelector } from "./PeriodSelector";
import { UserMenu } from "./UserMenu";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kanban", label: "Kanban", icon: KanbanSquare },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/monitoramento", label: "Monitoramento", icon: BarChart3 },
  { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/equipe", label: "Equipe", icon: Users },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/automacao", label: "Automação", icon: Zap },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/30">
      {/* Top bar with global filters and tools */}
      <header className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Global filters */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Filtro global:</span>
            <GlobalClientSelector />
            <PeriodSelector />
          </div>

          {/* Right: Tools and user menu */}
          <div className="flex items-center gap-2">
            <GlobalSearchDialog />
            <ThemeToggle />
            <NotificationsBell />
            <Separator orientation="vertical" className="h-6" />
            <UserMenu onSignOut={signOut} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <div className="flex h-16 items-center px-5 border-b border-sidebar-border">
            <Logo size="sm" />
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((n) => {
              const active = path === n.to || path.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
