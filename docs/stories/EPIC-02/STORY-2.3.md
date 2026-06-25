# STORY-2.3 — GET /api/auth/profile endpoint

**Epic:** EPIC-02 Auth & Session  
**Estimativa:** 0.5 points (30 minutos)  
**Priority:** P1 (Supporting)  
**Status:** Draft

---

## Descrição

Implementar endpoint que retorna dados do usuário logado atualmente. Usado para popular Header com nome/email/avatar.

---

## Acceptance Criteria

```gherkin
Given Frontend faz GET /api/auth/profile com token válido
When Servidor processa o request
Then Retorna JSON com id, name, email, avatar_url
And Status code é 200
And Token inválido retorna 401 Unauthorized
```

---

## Scope

### IN
- GET /api/auth/profile endpoint
- Autenticação por header (Bearer token)
- Return user object (id, name, email, avatar)
- Error handling (401 para token inválido)

### OUT
- Updating profile (separate story)
- Avatar upload
- Complex user data

---

## Dependências
- STORY-2.1 e STORY-2.2 (auth estrutura)

---

## Critério de Done
- [ ] GET /api/auth/profile implementado
- [ ] Valida token do header Authorization
- [ ] Retorna user data corretamente
- [ ] 401 error se token inválido/expirado
- [ ] Frontend pode chamar e usar dados
- [ ] Teste: `curl -H "Authorization: Bearer TOKEN" /api/auth/profile`
- [ ] Header atualiza com user info
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/auth.ts` | Add GET /profile | [ ] |
| `src/server/middleware/auth.ts` | Token validation | [ ] |
| `src/types/user.ts` | User type definition | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
