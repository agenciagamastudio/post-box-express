import { useClientFilter } from "@/contexts/ClientContext";

export function useGlobalClientFilter() {
  const { selectedClients, isFilterActive } = useClientFilter();

  /**
   * Filtra um array de objetos por client_id
   * Se nenhum cliente selecionado, retorna tudo
   */
  function filterByClient<T extends { client_id?: string | null }>(items: T[]): T[] {
    if (!isFilterActive || selectedClients.length === 0) {
      return items;
    }
    return items.filter((item) => item.client_id && selectedClients.includes(item.client_id));
  }

  /**
   * Retorna cláusula WHERE para queries Supabase
   * Exemplo: .in('client_id', selectedClients)
   */
  function getSupabaseFilter() {
    if (!isFilterActive || selectedClients.length === 0) {
      return null;
    }
    return { column: "client_id", operator: "in", value: selectedClients };
  }

  /**
   * Build a WHERE clause para usar em queries
   * Exemplo: query.in('client_id', selectedClients)
   */
  function applyToQuery<T>(query: T): T {
    if (!isFilterActive || selectedClients.length === 0) {
      return query;
    }
    // Retorna query com filter já aplicado (deve ser chamado após select)
    return (query as any).in("client_id", selectedClients);
  }

  return {
    selectedClients,
    isFilterActive,
    filterByClient,
    getSupabaseFilter,
    applyToQuery,
  };
}
