# STORY-6.3 — E2E Cypress — signup completo

**Epic:** EPIC-06 Tests & Coverage  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Quality)  
**Status:** Draft

---

## Descrição

Escrever testes E2E com Cypress cobrindo fluxo completo de signup: registrar, login, criar post, enviar aprovação.

---

## Acceptance Criteria

```gherkin
Given Rodo `npm run test:e2e`
When Cypress abre o browser
Then Simula usuário novo: registra, faz login, cria post
And Valida cada passo na UI
And Testes passam 100%
```

---

## Scope

### IN
- Cypress setup e configuração
- Test: Signup flow (formulário, validação, sucesso)
- Test: Login (credenciais, redirect)
- Test: Create post (form, upload, submit)
- Test: Send for approval (email link validation)
- Screenshots/videos on failure
- Baseline de performance

### OUT
- Visual regression tests
- Mobile E2E tests

---

## Dependências
- Todos os épics anteriores devem estar implementados

---

## Critério de Done
- [ ] Cypress instalado e configurado
- [ ] Tests para signup escrito
- [ ] Tests para login escrito
- [ ] Tests para post creation escrito
- [ ] Tests para approval flow escrito
- [ ] `npm run test:e2e` passes
- [ ] Screenshots gerados
- [ ] Sem flakiness (reliable tests)
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `cypress.config.ts` | Create Cypress config | [ ] |
| `cypress/e2e/auth.cy.ts` | Auth flow tests | [ ] |
| `cypress/e2e/posts.cy.ts` | Post creation tests | [ ] |
| `cypress/support/commands.ts` | Custom commands | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
