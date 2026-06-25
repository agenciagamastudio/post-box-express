# STORY-5.1 — Publish image — POST /api/instagram/publish

**Epic:** EPIC-05 Instagram Publishing  
**Estimativa:** 1.5 points (1.5 horas)  
**Priority:** P1 (Core feature - MVP)  
**Status:** Draft

---

## Descrição

Implementar endpoint que publica imagem no Instagram usando Graph API. Integrado com sistema de posts aprovados.

---

## Acceptance Criteria

```gherkin
Given Um post está aprovado
When Sistema publica no Instagram
Then Imagem é enviada à conta do cliente
And Post é marcado como "published"
And Data de publicação é registrada
And Link do Instagram é armazenado
```

---

## Scope

### IN
- POST /api/instagram/publish (enviar imagem)
- Autenticação com IG access token (armazenado no BD)
- Graph API v15+ integration
- Upload de imagem para IG
- Armazena media_id e post_url
- Status update: approved → published
- Error handling (token expirado, rate limit)

### OUT
- Video publishing (separate story)
- Carousel publishing
- Advanced caption formatting

---

## Dependências
- STORY-4.3 (aprovação deve estar feita)
- Instagram App deve estar configurado no Meta

---

## Critério de Done
- [ ] POST /api/instagram/publish implementado
- [ ] Graph API autenticação funcionando
- [ ] Imagem enviada ao Instagram corretamente
- [ ] Media ID armazenado no BD
- [ ] Status atualizado para "published"
- [ ] Link do post armazenado
- [ ] Erro handling: token expirado → re-auth, rate limit → retry
- [ ] Testado com imagem real
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/instagram.ts` | Add publish endpoint | [ ] |
| `src/server/lib/instagram-client.ts` | IG Graph API client | [ ] |
| `src/server/db/migrations/add_instagram_posts.sql` | Schema | [ ] |
| `src/types/instagram.ts` | IG types | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
