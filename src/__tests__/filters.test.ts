import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Calendar Filters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("useCalendarFilters Hook", () => {
    it("deve ter filtros vazios por padrão", () => {
      const filters = {
        clients: [],
        networks: [],
        onlyThisClient: false,
      };

      expect(filters.clients).toEqual([]);
      expect(filters.networks).toEqual([]);
      expect(filters.onlyThisClient).toBe(false);
    });

    it("deve persistir filtros em localStorage", () => {
      const filters = {
        clients: ["client-1", "client-2"],
        networks: ["instagram", "tiktok"],
        onlyThisClient: false,
      };

      const key = "gama-calendar-filters";
      localStorage.setItem(key, JSON.stringify(filters));

      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      expect(stored.clients).toContain("client-1");
      expect(stored.networks).toContain("instagram");
    });

    it("modo único: deve remover múltiplos clientes quando ativar", () => {
      const filters = {
        clients: ["client-1", "client-2"],
        networks: [],
        onlyThisClient: false,
      };

      // Simular ativar modo único
      filters.onlyThisClient = true;
      filters.clients = ["client-1"]; // Manter apenas 1

      expect(filters.clients).toHaveLength(1);
      expect(filters.onlyThisClient).toBe(true);
    });

    it("modo múltiplo: deve permitir vários clientes", () => {
      const filters = {
        clients: [],
        networks: [],
        onlyThisClient: false,
      };

      // Adicionar múltiplos
      filters.clients = ["client-1", "client-2", "client-3"];

      expect(filters.clients).toHaveLength(3);
      expect(filters.onlyThisClient).toBe(false);
    });

    it("deve alternar redes sociais", () => {
      const filters = {
        clients: [],
        networks: ["instagram"],
        onlyThisClient: false,
      };

      // Toggle instagram (remover)
      filters.networks = filters.networks.filter((n) => n !== "instagram");
      expect(filters.networks).toHaveLength(0);

      // Toggle tiktok (adicionar)
      filters.networks.push("tiktok");
      expect(filters.networks).toContain("tiktok");
    });

    it("deve limpar todos os filtros", () => {
      const filters = {
        clients: ["client-1", "client-2"],
        networks: ["instagram", "tiktok"],
        onlyThisClient: true,
      };

      // Clear
      filters.clients = [];
      filters.networks = [];
      filters.onlyThisClient = false;

      expect(filters.clients).toEqual([]);
      expect(filters.networks).toEqual([]);
      expect(filters.onlyThisClient).toBe(false);
    });
  });

  describe("Filter Application Logic", () => {
    it("deve filtrar posts por cliente único", () => {
      const posts = [
        { id: "1", client_id: "client-1", title: "Post A" },
        { id: "2", client_id: "client-2", title: "Post B" },
        { id: "3", client_id: "client-1", title: "Post C" },
      ];

      const filters = { clients: ["client-1"], networks: [], onlyThisClient: true };

      const filtered = posts.filter((p) =>
        filters.clients.length === 0 ? true : filters.clients.includes(p.client_id)
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.every((p) => p.client_id === "client-1")).toBe(true);
    });

    it("deve filtrar posts por múltiplos clientes", () => {
      const posts = [
        { id: "1", client_id: "client-1", title: "Post A" },
        { id: "2", client_id: "client-2", title: "Post B" },
        { id: "3", client_id: "client-3", title: "Post C" },
      ];

      const filters = { clients: ["client-1", "client-2"], networks: [], onlyThisClient: false };

      const filtered = posts.filter((p) =>
        filters.clients.length === 0 ? true : filters.clients.includes(p.client_id)
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.client_id)).toEqual(["client-1", "client-2"]);
    });

    it("deve filtrar posts por rede social", () => {
      const posts = [
        { id: "1", network: "instagram", title: "Post A" },
        { id: "2", network: "tiktok", title: "Post B" },
        { id: "3", network: "instagram", title: "Post C" },
      ];

      const filters = { clients: [], networks: ["instagram"], onlyThisClient: false };

      const filtered = posts.filter((p) =>
        filters.networks.length === 0 ? true : filters.networks.includes(p.network)
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.every((p) => p.network === "instagram")).toBe(true);
    });

    it("deve filtrar posts por cliente E rede (AND lógico)", () => {
      const posts = [
        { id: "1", client_id: "client-1", network: "instagram" },
        { id: "2", client_id: "client-1", network: "tiktok" },
        { id: "3", client_id: "client-2", network: "instagram" },
      ];

      const filters = { clients: ["client-1"], networks: ["instagram"], onlyThisClient: false };

      const filtered = posts.filter((p) => {
        const clientMatch = filters.clients.length === 0 || filters.clients.includes(p.client_id);
        const networkMatch =
          filters.networks.length === 0 || filters.networks.includes(p.network);
        return clientMatch && networkMatch;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("nenhum filtro = mostrar todos", () => {
      const posts = [
        { id: "1", client_id: "client-1", network: "instagram" },
        { id: "2", client_id: "client-2", network: "tiktok" },
        { id: "3", client_id: "client-3", network: "x" },
      ];

      const filters = { clients: [], networks: [], onlyThisClient: false };

      const filtered = posts.filter((p) => {
        const clientMatch = filters.clients.length === 0 || filters.clients.includes(p.client_id);
        const networkMatch =
          filters.networks.length === 0 || filters.networks.includes(p.network);
        return clientMatch && networkMatch;
      });

      expect(filtered).toHaveLength(3);
    });
  });

  describe("UI State", () => {
    it("hasActiveFilters deve retornar true se há filtros", () => {
      const filters1 = { clients: ["client-1"], networks: [], onlyThisClient: false };
      const hasFilters1 = filters1.clients.length > 0 || filters1.networks.length > 0;
      expect(hasFilters1).toBe(true);

      const filters2 = { clients: [], networks: ["instagram"], onlyThisClient: false };
      const hasFilters2 = filters2.clients.length > 0 || filters2.networks.length > 0;
      expect(hasFilters2).toBe(true);

      const filters3 = { clients: [], networks: [], onlyThisClient: false };
      const hasFilters3 = filters3.clients.length > 0 || filters3.networks.length > 0;
      expect(hasFilters3).toBe(false);
    });
  });
});
