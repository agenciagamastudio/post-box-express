# STORY-6.1 — Unit tests — utils/hooks

**Epic:** EPIC-06 Tests & Coverage  
**Estimativa:** 2 points (2 horas)  
**Priority:** P1 (Quality)  
**Status:** Draft

---

## Descrição

Escrever unit tests para funções utilitárias e hooks customizados usando Vitest + React Testing Library.

---

## Acceptance Criteria

```gherkin
Given Eu rodo `npm run test`
When Tests executam para utils e hooks
Then Todos passam
And Coverage está acima de 80%
And Mocking de APIs funciona corretamente
```

---

## Scope

### IN
- Unit tests para hooks: useGlobalClientFilter, usePostForm, useReelPublish
- Unit tests para utils: formatTime, validation functions
- Mock de fetch/API calls
- Test setup com Vitest
- Coverage report (80%+ target)
- Test snapshot validation

### OUT
- E2E tests (separate epic)
- Performance tests
- Visual regression tests

---

## Dependências
- Todos os utils/hooks devem estar implementados

---

## Critério de Done
- [ ] Tests criados para todos os hooks
- [ ] Tests criados para funções utils principais
- [ ] `npm run test` passes 100%
- [ ] Coverage >= 80%
- [ ] Mocks funcionando corretamente
- [ ] No console warnings/errors
- [ ] Test files organizados em __tests__
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/hooks/__tests__/useGlobalClientFilter.test.ts` | Create tests | [ ] |
| `src/hooks/__tests__/usePostForm.test.ts` | Create tests | [ ] |
| `src/utils/__tests__/formatTime.test.ts` | Create tests | [ ] |
| `src/utils/__tests__/validation.test.ts` | Create tests | [ ] |
| `vitest.config.ts` | Test config | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
