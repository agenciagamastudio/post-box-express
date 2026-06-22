import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CalendarFilters } from "@/hooks/useCalendarFilters";

type QuickFiltersProps = {
  filters: CalendarFilters;
  toggleClient: (clientId: string) => void;
  setOnlyClient: (clientId: string | null) => void;
  clearFilters: () => void;
};

export function QuickFilters({
  filters,
  toggleClient,
  setOnlyClient,
  clearFilters,
}: QuickFiltersProps) {
  const { data: clients } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,color")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const hasFilters = filters.clients.length > 0 || filters.networks.length > 0;
  const activeClients = clients?.filter((c) => filters.clients.includes(c.id)) || [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filtros ativos como badges removíveis */}
      {activeClients.map((client) => (
        <Badge
          key={client.id}
          variant="outline"
          className="gap-1 pl-2"
          style={{
            borderColor: client.color || "#A78BFA",
            background: `${client.color || "#A78BFA"}11`,
            color: client.color || "#A78BFA",
          }}
        >
          {client.name}
          <button
            onClick={() => (filters.onlyThisClient ? setOnlyClient(null) : toggleClient(client.id))}
            className="hover:opacity-60 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Menu dropdown de filtros rápidos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Clientes
            <ChevronDown className="h-4 w-4" />
            {activeClients.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                {activeClients.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Modo de visualização</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Todos os clientes */}
          <DropdownMenuCheckboxItem
            checked={!filters.onlyThisClient && filters.clients.length === 0}
            onCheckedChange={() => clearFilters()}
          >
            <span className="text-sm">Mostrar todos</span>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Clientes</DropdownMenuLabel>

          {/* Apenas um cliente */}
          {clients?.map((client) => (
            <DropdownMenuCheckboxItem
              key={client.id}
              checked={filters.onlyThisClient && filters.clients[0] === client.id}
              onCheckedChange={() => setOnlyClient(client.id)}
            >
              <div
                className="h-2 w-2 rounded-full mr-2"
                style={{ background: client.color || "#A78BFA" }}
              />
              <span className="text-sm">{client.name}</span>
            </DropdownMenuCheckboxItem>
          ))}

          {/* Múltiplos clientes */}
          {!filters.onlyThisClient && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Adicionar múltiplos</DropdownMenuLabel>
              {clients?.map((client) => (
                <DropdownMenuCheckboxItem
                  key={`multi-${client.id}`}
                  checked={filters.clients.includes(client.id)}
                  onCheckedChange={() => toggleClient(client.id)}
                >
                  <div
                    className="h-2 w-2 rounded-full mr-2"
                    style={{ background: client.color || "#A78BFA" }}
                  />
                  <span className="text-sm">{client.name}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {/* Limpar */}
          {hasFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => clearFilters()}>
                <span className="text-sm text-destructive">Limpar tudo</span>
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
