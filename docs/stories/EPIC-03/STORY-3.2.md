# STORY-3.2 — /calendario page — month/week view + filters

**Epic:** EPIC-03 Core Routes  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Implementar página /calendario com vistas Month e Week. Suporte para filtros por cliente e rede social. Posts aparecem como eventos no calendário.

---

## Acceptance Criteria

```gherkin
Given Na página /calendario
When Mudo de vista Month para Week (ou vice-versa)
Then O calendário muda o layout
And Os posts aparecem corretamente em ambas vistas
And Filtros de cliente e rede funcionam
```

---

## Scope

### IN
- /calendario route
- Month view (grid com semanas)
- Week view (24h timeline com 7 dias)
- Filtro por cliente (global filter)
- Filtro por rede social
- Posts exibindo como eventos
- GET /api/posts with date range

### OUT
- Criar posts direto do calendário (separate story)
- Editar posts no calendário
- Reminder notifications

---

## Dependências
- STORY-1.2 (calendar types deve estar feito)
- EPIC-01 completo

---

## Critério de Done
- [ ] /calendario route criada
- [ ] Month view funcional
- [ ] Week view funcional
- [ ] Switch entre views funciona
- [ ] Filtros funcionam (cliente, rede)
- [ ] Posts carregam corretamente
- [ ] Responsivo em mobile
- [ ] Testado em ambas vistas
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/pages/calendario.tsx` | Create calendar page | [ ] |
| `src/components/Calendar/MonthView.tsx` | Month view component | [ ] |
| `src/components/Calendar/WeekView.tsx` | Update week view | [ ] |
| `src/components/CalendarFilters.tsx` | Filter component | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
