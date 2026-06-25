# EPIC-01: TypeScript Compliance

**Status:** DRAFT  
**Priority:** CRITICAL (Blocks Build)  
**Effort:** 4h  
**Owner:** @dev (Dex)

---

## Objective

Eliminate all 32 TypeScript `any`-type errors across 8 codebase files. Achieve 100% type safety in production code and enable `npm run typecheck` to pass with 0 errors.

---

## Business Value

- ✅ Unblocks npm run build (currently failing)
- ✅ Enables reliable type checking in CI/CD
- ✅ Prevents runtime type-related bugs
- ✅ Improves developer experience (IDE autocomplete)
- ✅ Foundation for confident refactoring

---

## Acceptance Criteria

- [ ] All 32 `any` types resolved (typed correctly, not just cast)
- [ ] `npm run typecheck` → exit code 0 (0 errors, 0 warnings)
- [ ] No `any` type in production code without explicit JSDoc comment explaining why
- [ ] All imports resolved and typed
- [ ] No `@ts-ignore` comments (use type narrowing instead)
- [ ] Tests passing for modified files

---

## Files to Fix (8 Total)

| File | Error Count | Issue | Priority |
|------|-------------|-------|----------|
| `src/services/instagram.ts` | 8 | Graph API response typing | P1 |
| `src/components/PostCard.tsx` | 5 | Props type definitions | P1 |
| `src/hooks/useInstagramData.ts` | 6 | Hook return types | P1 |
| `src/types/post.ts` | 3 | Post interface incomplete | P1 |
| `src/api/client.ts` | 4 | Axios instance typing | P2 |
| `src/utils/validators.ts` | 2 | Function parameters | P2 |
| `src/contexts/AuthContext.tsx` | 2 | Context value type | P2 |
| `src/middleware/auth.ts` | 2 | Middleware handler type | P2 |

---

## Stories

### Story 01.1: Instagram Service Typing (8 errors)

**Description:**
Fix TypeScript errors in `src/services/instagram.ts`. Main issues:
- Graph API response object not properly typed
- Error handling missing type guards
- Function return types unclear

**Acceptance Criteria:**
- [ ] Graph API responses typed with interface
- [ ] Error catching with proper type narrowing
- [ ] Function signatures explicit (no implicit any)
- [ ] Tests passing

**Effort:** 1.5h

---

### Story 01.2: Component Props & Hooks Typing (11 errors)

**Description:**
Fix TypeScript errors in React components and hooks:
- `PostCard.tsx` — Props type incomplete
- `useInstagramData.ts` — Hook return type unclear
- Missing or incorrect generic types

**Acceptance Criteria:**
- [ ] All props typed as interfaces
- [ ] Hook return typed explicitly (T[] | Error handling)
- [ ] Generic types used where appropriate
- [ ] Components accept proper prop types

**Effort:** 1.5h

---

### Story 01.3: Core Types & Interfaces (5 errors)

**Description:**
Fix base type definitions in `src/types/post.ts`:
- Post interface incomplete fields
- Missing enum types for status
- API contract types undefined

**Acceptance Criteria:**
- [ ] All Post fields properly typed
- [ ] Enums defined for post status/visibility
- [ ] API response types match contracts
- [ ] Exports clean and documented

**Effort:** 1h

---

### Story 01.4: API Client & Middleware (8 errors)

**Description:**
Fix TypeScript errors in request/response handling:
- Axios instance typing
- Middleware handler signatures
- Validator function types

**Acceptance Criteria:**
- [ ] Axios typed with proper request/response
- [ ] Middleware handlers accept correct params
- [ ] Validators return typed boolean/error
- [ ] All endpoints consistent in typing

**Effort:** 1h

---

## Dependencies

- ⬅️ No dependencies (runs first, unblocks all others)

---

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Over-typing causes false positives | Delays debugging | LOW | Use type narrowing + guards |
| Missing type definitions in packages | Can't type everything | MEDIUM | Use `@types/*` packages, declare any as last resort |
| Breaking existing code | Regressions | MEDIUM | Run full test suite after each file |

---

## Definition of Done

- ✅ `npm run typecheck` passes (0 errors, 0 warnings)
- ✅ All 32 errors resolved
- ✅ No new `any` types introduced
- ✅ Test coverage maintained (no regression)
- ✅ Code review approval from @qa
- ✅ Commit message references EPIC-01

---

## Notes

- **Start with:** `instagram.ts` (highest impact)
- **Validate:** Run `npm run typecheck` after each story
- **Testing:** Run affected tests: `npm test -- --testPathPattern=instagram|PostCard|useInstagram`
