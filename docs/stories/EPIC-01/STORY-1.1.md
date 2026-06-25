# STORY-1.1 — Fix TypeScript any types: PostDialog

**Epic:** EPIC-01 TypeScript Compliance  
**Estimativa:** 2 points (2 horas)  
**Priority:** P0 (BLOCKER)  
**Status:** Draft

---

## Descrição

Remove TypeScript `any` types from PostDialog.tsx and PostDetailDialog.tsx, currently blocking build with ~8 TS errors related to event handlers and component props.

---

## Acceptance Criteria

```gherkin
Given I run `npm run lint`
When I check PostDialog.tsx and PostDetailDialog.tsx
Then I see 0 TS errors
And all type definitions are explicit (no `any` types)
And ESLint configuration passes (all 2B-E errors resolved)
```

---

## Scope

### IN
- PostDialog.tsx (lines 27, 129-131, event handler types)
- PostDetailDialog.tsx (affected lines with `any` types)
- Type safety for all props, state, and event handlers
- Component signatures and return types

### OUT
- Refactoring of unrelated components
- UI/UX changes
- Business logic modifications

---

## Dependências
- None (self-contained, no blocking tasks)

---

## Critério de Done
- [ ] All `any` types replaced with explicit types
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run typecheck` passes
- [ ] No new warnings introduced
- [ ] ESLint config validated (tsconfig.json, .eslintrc)
- [ ] Code reviewed by @qa
- [ ] File List updated below

---

## File List (for @dev)
| File | Change | Status |
|------|--------|--------|
| `src/components/PostDialog.tsx` | Type fixes | [ ] |
| `src/components/PostDetailDialog.tsx` | Type fixes | [ ] |
| `src/types/index.ts` | Add type definitions if needed | [ ] |

---

## Decisões
- Usar explicitamente `React.FC<Props>` ou `(props: Props) => JSX.Element`
- Event handlers: `(e: React.ChangeEvent<HTMLInputElement>) => void`
- Imports: Garantir que tipos estão importados corretamente de React/Node

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
