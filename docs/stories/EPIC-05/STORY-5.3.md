# STORY-5.3 — Publish carousel — múltiplas mídias

**Epic:** EPIC-05 Instagram Publishing  
**Estimativa:** 0.5 points (30 minutos)  
**Priority:** P2 (Enhancement)  
**Status:** Draft

---

## Descrição

Suporte para publicar carousels (posts com múltiplas imagens/vídeos) no Instagram.

---

## Acceptance Criteria

```gherkin
Given Um post tem múltiplas imagens/vídeos
When Sistema publica no Instagram
Then Cria carousel com todas as mídias
And Ordem é preservada
And Link do carousel é armazenado
```

---

## Scope

### IN
- POST /api/instagram/publish-carousel (multiple media items)
- Graph API carousel creation
- Reordering de mídia antes de publicar
- Validação: mín 2, máx 10 mídias

### OUT
- Editar carousel após publicar
- Reorder functionality in UI

---

## Dependências
- STORY-5.1 (image), STORY-5.2 (reel)

---

## Critério de Done
- [ ] Carousel upload funciona
- [ ] Múltiplas mídias sendo enviadas
- [ ] Ordem preservada
- [ ] Validação (2-10 itens)
- [ ] Status atualizado corretamente
- [ ] Testado com 3+ mídias
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/instagram.ts` | Add carousel | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
