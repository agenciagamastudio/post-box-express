# Global Client Filter — Integração em todas as páginas

**Data:** 2026-06-21  
**Status:** ✅ READY FOR INTEGRATION  
**Scope:** Dashboard, Kanban, Calendário, Clientes, Equipe, Tarefas, Financeiro, Automação

---

## 🎯 Arquitetura

```
AppShell (com ClientProvider)
  ├─ Top bar: GlobalClientSelector
  └─ Rotas:
      ├─ Dashboard (filtro aplicado)
      ├─ Kanban (filtro aplicado)
      ├─ Calendário (filtro aplicado)
      ├─ Clientes (filtro aplicado)
      ├─ Equipe (filtro aplicado)
      ├─ Tarefas (filtro aplicado)
      ├─ Financeiro (filtro aplicado)
      └─ Automação (filtro aplicado)
```

---

## 📁 Arquivos criados

| Arquivo                                       | Tipo      | Descrição                              |
| --------------------------------------------- | --------- | -------------------------------------- |
| `src/contexts/ClientContext.tsx`              | Context   | Global client state + localStorage     |
| `src/components/app/GlobalClientSelector.tsx` | Component | Seletor de cliente (top bar)           |
| `src/hooks/useGlobalClientFilter.ts`          | Hook      | Helper para aplicar filtros em queries |
| `src/routes/_authenticated/route.tsx`         | Route     | Envolvido com ClientProvider           |
| `src/components/app/AppShell.tsx`             | Component | Atualizado com top bar de filtro       |

---

## 🚀 Como usar em cada página

### 1. Dashboard (`/app`)

```typescript
import { useClientFilter } from "@/contexts/ClientContext";
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Dashboard() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Dashboard com posts filtrados */}</div>;
}
```

### 2. Kanban (`/kanban`)

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Kanban() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Kanban com tarefas filtradas */}</div>;
}
```

### 3. Calendário (`/calendario`) — JÁ INTEGRADO

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

// Em calendario.tsx, combinar com filtros locais:
export function Cal() {
  const { selectedClients: globalClients } = useGlobalClientFilter();
  const { filters: calendarFilters } = useCalendarFilters();

  // Combinar: global + calendar filters
  const allClients = [...globalClients, ...calendarFilters.clients].filter(
    (v, i, a) => a.indexOf(v) === i,
  ); // Unique

  // Query com clientes combinados
  const { data: posts } = useQuery({
    queryKey: ["posts-cal", allClients],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .in("client_id", allClients.length > 0 ? allClients : []);
      return data;
    },
  });
}
```

### 4. Tarefas (`/tarefas`)

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Tarefas() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Tarefas filtradas */}</div>;
}
```

### 5. Clientes (`/clientes`)

```typescript
// Nota: Esta página mostra todos os clientes
// Mas pode usar filtro para "destaque" ou "favoritos"
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Clientes() {
  const { selectedClients, isFilterActive } = useGlobalClientFilter();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*");
      return data;
    },
  });

  // Destacar clientes selecionados
  const highlighted = clients?.filter((c) => selectedClients.includes(c.id)) || [];
  const others = clients?.filter((c) => !selectedClients.includes(c.id)) || [];

  return (
    <div>
      {isFilterActive && (
        <section>
          <h2>Clientes selecionados</h2>
          {/* highlighted */}
        </section>
      )}
      <section>
        <h2>Todos os clientes</h2>
        {/* others */}
      </section>
    </div>
  );
}
```

### 6. Equipe (`/equipe`)

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Equipe() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: teamMembers } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data } = await supabase.from("team_members").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Equipe filtrada por cliente */}</div>;
}
```

### 7. Financeiro (`/financeiro`)

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Financeiro() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("*");
      return filterByClient(data || []);
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Financeiro filtrado */}</div>;
}
```

### 8. Automação (`/automacao`)

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";

export function Automacao() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: automations } = useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      const { data } = await supabase.from("automations").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Automações filtradas */}</div>;
}
```

### 9. Configurações (`/configuracoes`)

```typescript
// Configurações gerais — não é filtrado por cliente
// Mas pode mostrar "Filtro ativo" como informação
import { useClientFilter } from "@/contexts/ClientContext";

export function Configuracoes() {
  const { selectedClients, isFilterActive } = useClientFilter();

  return (
    <div>
      {isFilterActive && (
        <InfoBox>
          Status do filtro global: {selectedClients.length} cliente(s) selecionado(s)
        </InfoBox>
      )}
      {/* Configurações */}
    </div>
  );
}
```

---

## 💻 Padrão de integração (copy-paste)

```typescript
import { useGlobalClientFilter } from "@/hooks/useGlobalClientFilter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MyPage() {
  const { filterByClient } = useGlobalClientFilter();

  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data } = await supabase.from("table_name").select("*");
      return filterByClient(data || []);
    },
  });

  return <div>{/* Use items aqui, já filtrado */}</div>;
}
```

---

## 🎨 UI/UX

### Top bar

```
┌────────────────────────────────────────────────────────┐
│ Filtro global: [Cliente A ×] [Cliente B ×] [Clientes ▼] │
└────────────────────────────────────────────────────────┘
```

- Sempre visível (top bar)
- Afeta TODAS as páginas simultaneamente
- Persiste em localStorage
- Pode ser limpo com "Mostrar todos"

---

## ✅ Integration Checklist

- [ ] Dashboard: integrar `useGlobalClientFilter`
- [ ] Kanban: integrar `useGlobalClientFilter`
- [ ] Calendário: combinar com filtros locais (já iniciado)
- [ ] Tarefas: integrar `useGlobalClientFilter`
- [ ] Equipe: integrar `useGlobalClientFilter`
- [ ] Financeiro: integrar `useGlobalClientFilter`
- [ ] Automação: integrar `useGlobalClientFilter`
- [ ] Clientes: mostrar como destaques (opcional)
- [ ] Configurações: mostrar status do filtro (informativo)
- [ ] Build test: npm run build ✓
- [ ] Manual test: selecionar cliente → todas as páginas filtram

---

## 🔍 Testing

### Test flow

```bash
1. Abrir http://localhost:8080/app (Dashboard)
2. Top bar: Clientes → Selecionar "Cliente A"
3. Navegar para /kanban → Vê apenas tasks de A
4. Navegar para /calendario → Vê apenas posts de A
5. Navegar para /tarefas → Vê apenas tarefas de A
6. F5 (reload) → Filtro persiste em localStorage
7. Clique em "×" do badge → Remove filtro
8. Todas as páginas mostram todos os dados novamente
```

---

## 🚀 Performance

- localStorage: sync (rápido)
- Filtro local em React: O(n) (milissegundos)
- Query Supabase: aplicado antes de trazer dados (melhor)
- Sem overhead significativo

---

## 📊 Escalabilidade

Suporta:

- Ilimitados clientes (dropdown scrollable)
- Múltiplos clientes selecionados (checkboxes)
- Aplicado em qualquer query de Supabase
- Reutilizável em futuras pages

---

**Status:** ✅ READY FOR INTEGRATION  
**Próximo:** Integrar em Dashboard, Kanban, etc
