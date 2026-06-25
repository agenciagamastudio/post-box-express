# STORY-1.4 — Fix TypeScript any types: Hooks/utils (useGlobalClientFilter, CommentsSection)

**Epic:** EPIC-01 TypeScript Compliance  
**Estimativa:** 1 point (1 hora)  
**Priority:** P0 (BLOCKER)  
**Status:** Draft

---

## Descrição

Fix TypeScript `any` types in custom hooks and utility components: useGlobalClientFilter hook and CommentsSection component. These are shared utilities affecting multiple pages.

---

## Acceptance Criteria

```gherkin
Given I check the useGlobalClientFilter hook and CommentsSection
When I run `npm run lint`
Then I see 0 TS errors
And return types are explicit
And all data structures are typed
And component children/props are properly typed
```

---

## Scope

### IN
- src/hooks/useGlobalClientFilter.ts (hook types, return type)
- src/components/CommentsSection.tsx (component props, state types)
- Type definitions for filter state
- Type definitions for comment data structures

### OUT
- Filter functionality changes
- Comment display changes
- Comment interaction logic

---

## Dependências
- Should be done after STORY-1.1, 1.2, 1.3 (to avoid conflicts)

---

## Critério de Done
- [ ] useGlobalClientFilter.ts: proper return type annotation
- [ ] CommentsSection.tsx: 0 `any` types
- [ ] All filter state types defined
- [ ] All comment types defined
- [ ] Hook can be imported and used with type safety
- [ ] `npm run lint` passes
- [ ] Components render correctly in browser
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/hooks/useGlobalClientFilter.ts` | Type hook return | [ ] |
| `src/components/CommentsSection.tsx` | Type fixes | [ ] |
| `src/types/filters.ts` | Add filter types | [ ] |
| `src/types/comments.ts` | Add comment types | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
