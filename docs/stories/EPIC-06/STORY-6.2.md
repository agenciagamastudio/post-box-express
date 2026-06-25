# STORY-6.2 — Integration tests — auth flow

**Epic:** EPIC-06 Tests & Coverage  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Quality)  
**Status:** Draft

---

## Descrição

Escrever testes de integração para fluxo completo de autenticação: login, token refresh, logout.

---

## Acceptance Criteria

```gherkin
Given Rodo `npm run test:integration`
When Tests de auth flow executam
Then Login funciona end-to-end
And Token refresh funciona
And Logout limpa estado
And Todos os testes passam
```

---

## Scope

### IN
- Integration test: POST /auth/login com credenciais
- Integration test: POST /auth/refresh com token
- Integration test: POST /auth/logout
- Mock de database
- Test fixtures (usuários de teste)
- Session persistence check

### OUT
- E2E tests com browser real
- Multi-user scenarios

---

## Dependências
- EPIC-02 (auth endpoints) deve estar completo

---

## Critério de Done
- [ ] Tests para login flow
- [ ] Tests para token refresh
- [ ] Tests para logout
- [ ] Database fixtures funcionando
- [ ] Mock auth responses
- [ ] `npm run test:integration` passes
- [ ] Todos os cenários cobertos
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/__tests__/integration/auth.test.ts` | Create tests | [ ] |
| `src/__tests__/fixtures/auth.fixtures.ts` | Test data | [ ] |
| `vitest.config.integration.ts` | Integration test config | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
