import { useState, useEffect } from "react";

export type CalendarFilters = {
  clients: string[];
  networks: string[];
  onlyThisClient: boolean; // true = mostrar apenas 1 cliente, false = múltiplos
};

const STORAGE_KEY = "gama-calendar-filters";

export function useCalendarFilters() {
  const [filters, setFilters] = useState<CalendarFilters>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to load filters from storage:", e);
    }
    return {
      clients: [],
      networks: [],
      onlyThisClient: false,
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const toggleClient = (clientId: string) => {
    setFilters((prev) => {
      const newClients = prev.clients.includes(clientId)
        ? prev.clients.filter((c) => c !== clientId)
        : [...prev.clients, clientId];

      // Se ativar modo "only this client" e houver múltiplos clientes, manter só um
      if (prev.onlyThisClient && newClients.length > 1) {
        return { ...prev, clients: [clientId] };
      }

      return { ...prev, clients: newClients };
    });
  };

  const toggleNetwork = (network: string) => {
    setFilters((prev) => ({
      ...prev,
      networks: prev.networks.includes(network)
        ? prev.networks.filter((n) => n !== network)
        : [...prev.networks, network],
    }));
  };

  const setOnlyClient = (clientId: string | null) => {
    setFilters((prev) => ({
      ...prev,
      clients: clientId ? [clientId] : [],
      onlyThisClient: !!clientId,
    }));
  };

  const setMultipleClients = (clientIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      clients: clientIds,
      onlyThisClient: false,
    }));
  };

  const clearFilters = () => {
    setFilters({
      clients: [],
      networks: [],
      onlyThisClient: false,
    });
  };

  const hasActiveFilters = filters.clients.length > 0 || filters.networks.length > 0;

  return {
    filters,
    toggleClient,
    toggleNetwork,
    setOnlyClient,
    setMultipleClients,
    clearFilters,
    hasActiveFilters,
  };
}
