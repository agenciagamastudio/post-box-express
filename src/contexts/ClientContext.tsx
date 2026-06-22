import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ClientContextType = {
  selectedClients: string[]; // IDs dos clientes selecionados
  isFilterActive: boolean; // true se há filtro ativo
  toggleClient: (clientId: string) => void;
  setClients: (clientIds: string[]) => void;
  clearFilter: () => void;
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const STORAGE_KEY = "gama-global-client-filter";

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClients, setSelectedClients] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persistir em localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedClients));
  }, [selectedClients]);

  const toggleClient = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((c) => c !== clientId) : [...prev, clientId]
    );
  };

  const setClients = (clientIds: string[]) => {
    setSelectedClients(clientIds);
  };

  const clearFilter = () => {
    setSelectedClients([]);
  };

  const isFilterActive = selectedClients.length > 0;

  return (
    <ClientContext.Provider
      value={{
        selectedClients,
        isFilterActive,
        toggleClient,
        setClients,
        clearFilter,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClientFilter() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClientFilter deve ser usado dentro de ClientProvider");
  }
  return context;
}
