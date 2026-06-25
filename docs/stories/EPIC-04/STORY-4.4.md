# STORY-4.4 — Schedule post — calendar picker

**Epic:** EPIC-04 Post Creation & Approval  
**Estimativa:** 1.5 points (1.5 horas)  
**Priority:** P1 (Core feature)  
**Status:** Draft

---

## Descrição

Implementar agendamento de posts com date/time picker integrado. Posts agendados aparecem no calendário e são publicados automaticamente na hora.

---

## Acceptance Criteria

```gherkin
Given Na criação de post, clico em "Agendar"
When Abre date/time picker
Then Posso selecionar data e hora
When Salvo o post agendado
Then Post aparece no calendário
And Post é publicado automaticamente na hora agendada
```

---

## Scope

### IN
- Date/time picker no form de criação (STORY-4.1)
- Validação: data >= hoje, hora >= agora
- Status "scheduled" no banco
- Cron job ou background task que publica posts agendados
- Posts agendados aparecem no calendário com visual diferente
- GET /api/posts?status=scheduled

### OUT
- Editar post agendado
- Cancelar publicação agendada
- Timezone support (complexo)

---

## Dependências
- STORY-4.1 (form criação)
- STORY-3.2 (calendário)

---

## Critério de Done
- [ ] Date/time picker integrado no form
- [ ] Validação de data/hora funcionando
- [ ] Posts agendados salvos corretamente
- [ ] Posts aparecem no calendário
- [ ] Cron job publicando automaticamente
- [ ] Status mudando de "scheduled" para "published"
- [ ] Testado: agendar post, esperar hora, verificar publicação
- [ ] Sem erros no background task
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/components/forms/PostForm.tsx` | Update with date picker | [ ] |
| `src/server/cron/publish-scheduled-posts.ts` | Cron job | [ ] |
| `src/server/api/routes/posts.ts` | Handle scheduled status | [ ] |
| `src/server/db/migrations/add_scheduled_posts.sql` | DB schema | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
