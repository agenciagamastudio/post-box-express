import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";
import { CalendarFilters } from "@/hooks/useCalendarFilters";

const NETWORKS = [
  { value: "instagram", label: "📷 Instagram" },
  { value: "tiktok", label: "🎬 TikTok" },
  { value: "x", label: "𝕏 X" },
  { value: "outras", label: "🌐 Outras" },
];

type CalendarFiltersProps = {
  filters: CalendarFilters;
  toggleClient: (clientId: string) => void;
  toggleNetwork: (network: string) => void;
  setOnlyClient: (clientId: string | null) => void;
  clearFilters: () => void;
};

export function CalendarFiltersPanel({
  filters,
  toggleClient,
  toggleNetwork,
  setOnlyClient,
  clearFilters,
}: CalendarFiltersProps) {
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
  const activeNetworks = NETWORKS.filter((n) => filters.networks.includes(n.value));
  const activeClients = clients?.filter((c) => filters.clients.includes(c.id));

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Filtros</h3>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs"
          >
            Limpar tudo
          </Button>
        )}
      </div>

      {/* Redes Sociais */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Redes Sociais</Label>
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map((net) => (
            <Badge
              key={net.value}
              variant={filters.networks.includes(net.value) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80 transition"
              onClick={() => toggleNetwork(net.value)}
            >
              {net.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Clientes - Modo Único */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Clientes</Label>

        {/* Modo: Visualizar todos */}
        <div className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition cursor-pointer">
          <input
            type="radio"
            id="all-clients"
            name="client-mode"
            checked={!filters.onlyThisClient && filters.clients.length === 0}
            onChange={() => clearFilters()}
            className="h-4 w-4"
          />
          <Label htmlFor="all-clients" className="text-sm cursor-pointer flex-1">
            Mostrar todos
          </Label>
        </div>

        {/* Modo: Apenas um cliente */}
        <div className="space-y-2 pl-2">
          {clients?.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition"
            >
              <input
                type="radio"
                id={`client-only-${client.id}`}
                name="client-mode"
                checked={filters.onlyThisClient && filters.clients[0] === client.id}
                onChange={() => setOnlyClient(client.id)}
                className="h-4 w-4"
              />
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ background: client.color || "#A78BFA" }}
              />
              <Label htmlFor={`client-only-${client.id}`} className="text-sm cursor-pointer flex-1">
                {client.name}
              </Label>
            </div>
          ))}
        </div>

        {/* Modo: Múltiplos clientes */}
        {!filters.onlyThisClient && (
          <div>
            <Label className="text-xs font-medium text-muted-foreground block mb-2">
              Adicional: Múltiplos clientes
            </Label>
            <div className="space-y-1 pl-2">
              {clients?.map((client) => (
                <div key={client.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`client-multi-${client.id}`}
                    checked={filters.clients.includes(client.id)}
                    onCheckedChange={() => toggleClient(client.id)}
                  />
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ background: client.color || "#A78BFA" }}
                  />
                  <Label
                    htmlFor={`client-multi-${client.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {client.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumo de Filtros Ativos */}
      {hasFilters && (
        <>
          <Separator className="my-2" />
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground block">
              Filtros ativos
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {/* Redes ativas */}
              {activeNetworks.map((net) => (
                <Badge
                  key={net.value}
                  variant="secondary"
                  className="gap-1 pl-2 text-xs"
                >
                  {net.label}
                  <button
                    onClick={() => toggleNetwork(net.value)}
                    className="hover:text-foreground/60 transition ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {/* Clientes ativos */}
              {activeClients?.map((client) => (
                <Badge
                  key={client.id}
                  variant="secondary"
                  className="gap-1 pl-2 text-xs"
                  style={{
                    borderColor: client.color || "#A78BFA",
                    color: client.color || "#A78BFA",
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: client.color || "#A78BFA" }}
                  />
                  {client.name}
                  <button
                    onClick={() =>
                      filters.onlyThisClient ? setOnlyClient(null) : toggleClient(client.id)
                    }
                    className="hover:opacity-60 transition ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
