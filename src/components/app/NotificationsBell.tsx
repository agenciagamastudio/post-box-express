import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function NotificationsBell() {
  const { data: notifications } = useNotifications();

  const hasNotifications = notifications && notifications.total > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {notifications.total > 9 ? "9+" : notifications.total}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!hasNotifications && (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">Tudo em dia!</div>
        )}

        {hasNotifications && (
          <>
            {/* Aprovações pendentes */}
            {notifications.approval.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-semibold text-foreground/60">
                  Aprovação ({notifications.approval.length})
                </DropdownMenuLabel>
                {notifications.approval.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link to={item.href} className="cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Contas vencidas */}
            {notifications.overdue.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-semibold text-destructive">
                  Vencidos ({notifications.overdue.length})
                </DropdownMenuLabel>
                {notifications.overdue.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link to={item.href} className="cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Falhas de publicação */}
            {notifications.failed.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-semibold text-destructive">
                  Falhas ({notifications.failed.length})
                </DropdownMenuLabel>
                {notifications.failed.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link to={item.href} className="cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
