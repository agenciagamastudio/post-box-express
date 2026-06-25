# STORY-2.2 — Session persistence + token refresh

**Epic:** EPIC-02 Auth & Session  
**Estimativa:** 1.5 points (1.5 horas)  
**Priority:** P0 (Auth critical)  
**Status:** Draft

---

## Descrição

Implementar persistência de sessão (manter usuário logado ao recarregar a página) e refresh token automático para evitar expiração durante uso.

---

## Acceptance Criteria

```gherkin
Given Um usuário fez login
When A página é recarregada (F5)
Then O usuário permanece logado
And O token é automaticamente renovado se próximo de expirar
And Não há flicker de tela de login
```

---

## Scope

### IN
- localStorage persistence de auth token
- Refresh token endpoint no backend
- Verificação de expiração antes de cada request
- Auto-refresh on app load
- Handling de token expirado (redirect to login)

### OUT
- Multi-device session sync
- Session timeout warnings
- Advanced security (2FA refresh)

---

## Dependências
- STORY-2.1 (logout funcional) deve estar feito

---

## Critério de Done
- [ ] Token armazenado em localStorage com expiração
- [ ] POST /api/auth/refresh endpoint implementado
- [ ] Frontend verifica token expiração antes de cada request
- [ ] Auto-refresh acontece automaticamente
- [ ] Página recarregada mantém login (sem flicker)
- [ ] Token expirado → redireciona para login
- [ ] Testado: recarregar página, esperar, fazer request
- [ ] Sem memory leaks (cleanup on logout)
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/auth.ts` | Add POST /refresh | [ ] |
| `src/store/auth.ts` | Add token refresh logic | [ ] |
| `src/lib/api-client.ts` | Add request interceptor | [ ] |
| `src/app.tsx` | Add session check on load | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
