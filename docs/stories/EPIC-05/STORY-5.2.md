# STORY-5.2 — Publish reel — com polling

**Epic:** EPIC-05 Instagram Publishing  
**Estimativa:** 1 point (1 hora)  
**Priority:** P1 (Core feature - MVP)  
**Status:** Draft

---

## Descrição

Publicar vídeos curtos (reels) no Instagram. Videos maiores são processados em background, com polling para status.

---

## Acceptance Criteria

```gherkin
Given Um post com vídeo está aprovado
When Sistema envia para Instagram
Then Vídeo começa a processar
And Frontend faz polling a cada 5s para status
And Quando pronto, post é marcado como "published"
```

---

## Scope

### IN
- POST /api/instagram/publish-reel (enviar vídeo)
- Graph API video upload (iniciates processing)
- Polling endpoint GET /api/instagram/reel-status/{id}
- Video validation (formato, duração max 60s, tamanho max 100MB)
- Error handling: video muito grande, formato inválido
- Status tracking: uploading, processing, published, failed

### OUT
- Direct video messages (DMs)
- Stories with video
- Video scheduling

---

## Dependências
- STORY-5.1 (image publishing deve estar feito)

---

## Critério de Done
- [ ] Reel upload funciona
- [ ] Video processing em background
- [ ] Polling retorna status correto
- [ ] Validação de vídeo funcionando
- [ ] Status final: published ou failed
- [ ] Erro handling: arquivo muito grande, formato inválido
- [ ] Testado com vídeo real
- [ ] Frontend faz polling e atualiza UI
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/instagram.ts` | Add reel endpoints | [ ] |
| `src/server/lib/instagram-client.ts` | Update IG client | [ ] |
| `src/hooks/useReelPublish.ts` | Polling hook | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
