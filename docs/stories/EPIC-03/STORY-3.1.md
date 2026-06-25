# STORY-3.1 — /kanban page — drag-drop + status update

**Epic:** EPIC-03 Core Routes  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Implementar página /kanban com cards de posts em colunas de status (TODO, Review, Approved, Published). Suporte drag-drop entre colunas com atualização de status.

---

## Acceptance Criteria

```gherkin
Given Na página /kanban
When Clico e arrasto um card de uma coluna para outra
Then O card se move visualmente
And O status do post é atualizado no backend
And A página mostra posts atualizados após refresh
```

---

## Scope

### IN
- /kanban route com layout kanban (colunas)
- 4 colunas: TODO, Review, Approved, Published
- Drag-drop library (react-beautiful-dnd ou similar)
- Update POST /api/posts/{id}/status
- GET /api/posts para carregar posts
- Filtering by client (usa global filter)

### OUT
- Adicionar novos status
- Bulk operations
- Assignee management

---

## Dependências
- STORY-2.3 (auth profile, para aparecer no header)
- EPIC-01 completo (type safety)

---

## Critério de Done
- [ ] /kanban route criada
- [ ] Cards exibindo corretamente
- [ ] Drag-drop funcional entre colunas
- [ ] Status update funciona (API call)
- [ ] Global client filter funciona
- [ ] Sem erros console
- [ ] Testado: arrastar card, esperar update
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/kanban.tsx` | Create kanban page | [ ] |
| `src/components/KanbanBoard.tsx` | Kanban layout + drag | [ ] |
| `src/components/KanbanCard.tsx` | Card component | [ ] |
| `src/server/api/routes/posts.ts` | Add PATCH status | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
