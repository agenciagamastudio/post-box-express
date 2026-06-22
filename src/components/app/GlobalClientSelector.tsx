import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientFilter } from "@/contexts/ClientContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function GlobalClientSelector() {
  const { selectedClients, toggleClient, clearFilter, isFilterActive } = useClientFilter();

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

  const selectedClientNames = clients?.filter((c) => selectedClients.includes(c.id)) || [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Badges dos clientes selecionados */}
      {selectedClientNames.map((client) => (
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
          <div className="h-2 w-2 rounded-full" style={{ background: client.color || "#A78BFA" }} />
          {client.name}
          <button
            onClick={() => toggleClient(client.id)}
            className="hover:opacity-60 transition ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Dropdown de seleção */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Clientes
            <ChevronDown className="h-4 w-4" />
            {selectedClients.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                {selectedClients.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs">Filtrar por cliente</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Mostrar todos */}
          <DropdownMenuCheckboxItem
            checked={selectedClients.length === 0}
            onCheckedChange={() => clearFilter()}
          >
            <span className="text-sm">Mostrar todos</span>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {/* Lista de clientes */}
          {clients?.map((client) => (
            <DropdownMenuCheckboxItem
              key={client.id}
              checked={selectedClients.includes(client.id)}
              onCheckedChange={() => toggleClient(client.id)}
            >
              <div
                className="h-2 w-2 rounded-full mr-2"
                style={{ background: client.color || "#A78BFA" }}
              />
              <span className="text-sm">{client.name}</span>
            </DropdownMenuCheckboxItem>
          ))}

          {/* Limpar */}
          {isFilterActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => clearFilter()}>
                <span className="text-sm text-destructive">Limpar filtro</span>
              </DropdownMenuCheckboxItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
