import { LogOut, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const { data: profile } = useCurrentProfile();

  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ""} />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold">{profile?.full_name || "Usuário"}</p>
            {profile?.roles.length ? (
              <p className="text-xs text-muted-foreground">{profile.roles.join(", ")}</p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/configuracoes" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
