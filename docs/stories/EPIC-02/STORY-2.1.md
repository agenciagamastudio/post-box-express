# STORY-2.1 — Logout funcional + POST /auth/logout endpoint

**Epic:** EPIC-02 Auth & Session  
**Estimativa:** 1 point (1 hora)  
**Priority:** P0 (Auth critical)  
**Status:** Draft

---

## Descrição

Implementar logout completo: endpoint backend que limpa sessão + remover auth token do frontend + redirecionar para login.

---

## Acceptance Criteria

```gherkin
Given Um usuário logado clica no botão "Logout"
When O frontend chama POST /api/auth/logout
Then O backend limpa a sessão
And O token é invalidado/removido
And O frontend redireciona para /login
And O usuário volta à tela inicial
```

---

## Scope

### IN
- Backend: POST /api/auth/logout endpoint (limpar sessão, cookies)
- Frontend: Logout button handler
- Redux/Context: Clear auth state
- Redirect logic to /login

### OUT
- Changing login flow
- Changing authentication method
- Implementing new auth strategies (OAuth, 2FA)

---

## Dependências
- Existing auth system deve estar em lugar (assumido como feito)

---

## Critério de Done
- [ ] POST /api/auth/logout implementado no backend
- [ ] Frontend chama endpoint corretamente
- [ ] Auth token removido do localStorage/sessionStorage
- [ ] Redux/Context state limpo
- [ ] Usuário redireciona para /login
- [ ] Botão "Logout" está visível e funcional
- [ ] Testado manualmente (login → logout → volta pra login)
- [ ] Sem erros no console
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/server/api/routes/auth.ts` | Add POST /logout | [ ] |
| `src/components/Header.tsx` | Add logout button | [ ] |
| `src/store/auth.ts` | Add clearAuth action | [ ] |
| `src/pages/login.tsx` | Ensure redirect works | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
