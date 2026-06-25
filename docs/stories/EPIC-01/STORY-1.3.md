# STORY-1.3 — Fix TypeScript any types: Routes (kanban, financeiro, tarefas, monitoramento)

**Epic:** EPIC-01 TypeScript Compliance  
**Estimativa:** 1 point (1 hora)  
**Priority:** P0 (BLOCKER)  
**Status:** Draft

---

## Descrição

Fix TypeScript `any` types in route components: kanban.tsx, financeiro.tsx, tarefas.tsx, and monitoramento.tsx. These are main application routes that need type safety.

---

## Acceptance Criteria

```gherkin
Given I open the route files (kanban, financeiro, tarefas, monitoramento)
When I run `npm run lint`
Then I see 0 TS errors in any of these files
And all props passed to child components are typed
And event handlers have explicit signatures
```

---

## Scope

### IN
- src/pages/kanban.tsx (component types, data types)
- src/pages/financeiro.tsx (financial data types)
- src/pages/tarefas.tsx (task data types)
- src/pages/monitoramento.tsx (monitoring/analytics types)
- Props interfaces for these pages

### OUT
- Feature implementations
- Page layout changes
- Business logic refactors

---

## Dependências
- STORY-1.1, STORY-1.2 should be done first (reduce merge conflicts)

---

## Critério de Done
- [ ] kanban.tsx: 0 `any` types
- [ ] financeiro.tsx: 0 `any` types
- [ ] tarefas.tsx: 0 `any` types
- [ ] monitoramento.tsx: 0 `any` types
- [ ] All route components import needed types
- [ ] `npm run lint` passes for all 4 files
- [ ] Pages still load without errors
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/kanban.tsx` | Type fixes | [ ] |
| `src/pages/financeiro.tsx` | Type fixes | [ ] |
| `src/pages/tarefas.tsx` | Type fixes | [ ] |
| `src/pages/monitoramento.tsx` | Type fixes | [ ] |
| `src/types/pages.ts` | Add page-specific types | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
