# 🚨 TypeScript Errors Analysis — GAMA_CRONOGRAMAS

**Data:** 2026-06-25  
**Total Errors:** 32+ (verified via `npx tsc --noEmit`)  
**Blocker Status:** ✅ BUILD BLOCKED  

---

## 📊 Error Summary by Category

| Category | Count | Root Cause | Severity |
|----------|-------|-----------|----------|
| **Supabase Schema Mismatch** | 12 | Tables not in Supabase schema (publish_log, post_reviews) | 🔴 CRITICAL |
| **Missing Relations** | 8 | Relations defined in code but not in Supabase | 🔴 CRITICAL |
| **Type Cast Errors** | 6 | Type assertions without proper error handling | 🟠 HIGH |
| **Property Type Mismatches** | 4 | null vs undefined, union type issues | 🟠 HIGH |
| **JSX Duplicate Attributes** | 1 | Duplicate attribute in JSX element | 🟡 MEDIUM |
| **Test Module Not Found** | 1 | Missing vitest dependency in test files | 🟡 MEDIUM |

---

## 🔴 CRITICAL Errors (12 Total)

### Category: Supabase Schema Mismatch

These errors occur because the code references tables/relations that **don't exist in Supabase**:

#### Error 1-4: `"publish_log"` Table Not Found

**Files Affected:**
- `src/hooks/useNotifications.ts` (line 34)
- `src/routes/_authenticated/automacao.tsx` (line 42)
- `src/routes/_authenticated/integracoes.$clientId.tsx` (line 96)

**Error Message:**
```
error TS2769: No overload matches this call.
Argument of type '"publish_log"' is not assignable to parameter of type '"clients" | ... | "user_roles"'
```

**Root Cause:**  
Code tries to query `.from("publish_log")` but this table doesn't exist in Supabase. Either:
1. Table needs to be created in Supabase
2. Code should query different table (e.g., `posts`, `instagram_connections`)

**Fix Strategy:**
- [ ] Option A: Create `publish_log` table in Supabase (schema TBD)
- [ ] Option B: Replace `publish_log` queries with existing tables (posts, instagram_connections)
- [ ] Recommendation: **Option B** — reuse existing tables, avoid new schema

---

#### Error 5-8: `"post_reviews"` Relation Not Found

**Files Affected:**
- `src/routes/_authenticated/kanban.tsx` (line 74, 92)
- `src/routes/_authenticated/calendario.tsx` (line 97)

**Error Message:**
```
error TS2769: No overload matches this call.
Argument of type '"post_reviews"' is not assignable to parameter of type '"clients" | ... | "user_roles"'
```

**Root Cause:**  
Code tries to query `.select(...post_reviews(...))` but this table doesn't exist. PostreSQL schema shows no relation between `posts` and `post_reviews`.

**Fix Strategy:**
- [ ] Check if `post_reviews` table exists in Supabase
- [ ] If not: create table with schema (post_id FK, reviewer_id FK, comment, status, created_at)
- [ ] If yes: update Supabase auto-generated types (regenerate via Supabase CLI)

---

#### Error 9-12: Missing Columns in Relations

**Files Affected:**
- `src/hooks/useNotifications.ts` (line 56-59)
- `src/routes/_authenticated/kanban.tsx` (line 82, 97)

**Error Message:**
```
error TS2339: Property 'id' does not exist on type 'SelectQueryError'
Property 'token' does not exist on type 'SelectQueryError'
```

**Root Cause:**  
When Supabase relations fail (because table/relation doesn't exist), the query returns `SelectQueryError` instead of the expected data. Code tries to access properties that don't exist on error object.

**Fix Strategy:**  
Once **Error 1-8** are fixed (add missing tables/relations), these will resolve automatically because data will be returned instead of errors.

---

## 🟠 HIGH Severity Errors (10 Total)

### Category: Type Cast / Assertion Errors

#### Error 13-16: Unsafe Type Casting (`as Post[]` / `as LogRow[]`)

**Files Affected:**
- `src/routes/_authenticated/automacao.tsx` (line 47)
- `src/routes/_authenticated/calendario.tsx` (line 97)
- `src/routes/_authenticated/integracoes.$clientId.tsx` (line 102)
- `src/routes/_authenticated/kanban.tsx` (multiple)

**Error Message:**
```
error TS2352: Conversion of type 'SelectQueryError' to type 'Post[]' 
may be a mistake because neither type sufficiently overlaps with the other.
If this was intentional, convert the expression to 'unknown' first.
```

**Root Cause:**  
Code uses `as Post[]` to force type conversion without proper error handling. If Supabase returns `SelectQueryError`, the cast succeeds but runtime will fail.

**Fix Strategy:**
```typescript
// ❌ CURRENT (unsafe)
const posts = data as Post[];

// ✅ CORRECT (with error handling)
if (!data || Array.isArray(data) === false) {
  console.error('Invalid data:', data);
  return [];
}
const posts = data as Post[];
```

**Files to Fix:** 3 files, 4 locations

---

#### Error 17-20: Property Type Mismatches (null vs undefined)

**Files Affected:**
- `src/hooks/useNotifications.ts` (line 48)
- `src/__tests__/filters.test.ts` (line 85-207)

**Error Message:**
```
error TS2322: Type 'string | null' is not assignable to type 'string | undefined'
Type 'null' is not assignable to type 'string | undefined'
```

**Root Cause:**  
Supabase returns `null` for missing values, but component types expect `undefined`. This is a union type mismatch.

**Fix Strategy:**
```typescript
// ❌ CURRENT
interface NotificationItem {
  createdAt: string | undefined;
}

// ✅ CORRECT
interface NotificationItem {
  createdAt: string | null;  // or use nullish coalescing
}

// Or normalize on fetch:
const items = data.map(item => ({
  ...item,
  createdAt: item.createdAt ?? undefined
}));
```

---

#### Error 21-22: Incompatible Callbacks (Different Post Types)

**File:** `src/routes/_authenticated/calendario.tsx` (line 316)

**Error Message:**
```
error TS2322: Type '(post: Post) => void' is not assignable to type 
'(post: import(".../WeekView").Post) => void'
Types of parameters 'post' and 'post' are incompatible.
Type 'Post' is missing properties: status, format
```

**Root Cause:**  
Two different `Post` types defined:
1. In `calendario.tsx` (missing `status`, `format`)
2. In `components/calendar/WeekView.tsx` (has `status`, `format`)

Code passes one type where the other is expected.

**Fix Strategy:**
- [ ] **Unify Post type**: Create single `Post` type in `src/types/post.ts`
- [ ] Import everywhere
- [ ] Remove duplicate type definitions

---

### Category: JSX & DOM Issues

#### Error 23: Duplicate JSX Attributes

**File:** `src/components/calendar/WeekView.tsx` (line 60)

**Error Message:**
```
error TS17001: JSX elements cannot have multiple attributes with the same name.
```

**Root Cause:**  
Element has same attribute defined twice (likely `key`, `id`, or `className`).

**Fix Strategy:**
Remove duplicate attribute from JSX element.

---

## 🟡 MEDIUM Severity Errors (2 Total)

### Category: Test Configuration

#### Error 24: Missing Vitest Module

**File:** `src/__tests__/filters.test.ts` (line 1)

**Error Message:**
```
error TS2307: Cannot find module 'vitest' or its corresponding type declarations.
```

**Root Cause:**  
`vitest` not installed or not in `tsconfig.json` paths.

**Fix Strategy:**
```bash
npm install --save-dev vitest @vitest/ui
```

Then add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

---

## 🎯 Epic-1 Implementation Plan (CRITICAL FIRST)

**Recommended Fix Order:**

### Phase 1: Fix Supabase Schema (BLOCKER)
```
1. Verify/Create "publish_log" table
   - Columns: id, status, provider, external_id, message, created_at, updated_at
   - Time: 30min

2. Verify/Create "post_reviews" table
   - Columns: id, post_id (FK posts), reviewer_id (FK profiles), comment, status, created_at
   - Time: 30min

3. Regenerate Supabase types
   - Run: npx supabase gen types typescript > src/types/database.ts
   - Update imports if needed
   - Time: 10min
```

### Phase 2: Fix Type Definitions (2h)
```
1. Create unified Post type
   - File: src/types/post.ts
   - Properties: id, title, scheduled_at, network, client_id, clients, caption, 
                 cover_url, status, format, published_at, post_reviews
   - Time: 20min

2. Fix useNotifications hook
   - Update NotificationItem interface (null vs undefined)
   - Add error handling for SelectQueryError
   - Time: 30min

3. Fix calendar components
   - Update WeekView, ProgressiveView Post type
   - Remove duplicate definitions
   - Time: 30min

4. Fix route files
   - kanban.tsx: proper error handling for Supabase queries
   - automacao.tsx: safe type casting
   - integracoes.$clientId.tsx: same
   - Time: 40min
```

### Phase 3: Fix JSX & Tests (1h)
```
1. Fix WeekView duplicate attributes
   - Identify and remove duplicate
   - Time: 10min

2. Install vitest and configure
   - npm install --save-dev vitest @vitest/ui
   - Update tsconfig.json
   - Time: 20min

3. Fix test type errors
   - Update filters.test.ts array types
   - Time: 30min
```

---

## 📋 Error Checklist (for @dev implementation)

### EPIC-01 Stories Breakdown

**Story 1.1: Fix Supabase Schema Mismatch**
- [ ] Create/verify `publish_log` table
- [ ] Create/verify `post_reviews` table
- [ ] Regenerate Supabase types
- [ ] Verify no `SelectQueryError` type annotations remain
- **Est. Time:** 1.5h

**Story 1.2: Unify Post Type Definition**
- [ ] Create `src/types/post.ts`
- [ ] Define canonical `Post` interface
- [ ] Update all imports (calendario, kanban, WeekView)
- [ ] Remove duplicate Post types
- [ ] Verify type assignments work end-to-end
- **Est. Time:** 1h

**Story 1.3: Fix Hook & Component Type Mismatches**
- [ ] Update `useNotifications` (null vs undefined)
- [ ] Fix `calendario.tsx` Post type callback
- [ ] Fix `kanban.tsx` post_reviews queries
- [ ] Add proper error handling (don't use unsafe `as`)
- **Est. Time:** 1h

**Story 1.4: Fix JSX, Tests, and Verify Build**
- [ ] Fix WeekView duplicate attributes
- [ ] Install and configure vitest
- [ ] Fix test type errors
- [ ] Run `npm run build` → PASS
- [ ] Run `npm run lint` → PASS
- **Est. Time:** 0.5h

---

## 🚀 Expected Outcome

After implementing all EPIC-01 fixes:

```bash
✅ npm run build      → SUCCESS (0 errors)
✅ npm run lint       → SUCCESS (0 errors)
✅ npm run typecheck  → SUCCESS (0 errors)
✅ npm test           → PASS (all tests)
```

**Total Time Estimate:** 4-5 hours for experienced TypeScript developer  
**Blocker to Remove:** Supabase schema + type definitions  
**Next Epic:** EPIC-02 (Auth & Session) — can't start until build passes

---

## 📍 File Summary (Affected Files)

| File | Errors | Type | Priority |
|------|--------|------|----------|
| `src/hooks/useNotifications.ts` | 5 | Schema + Type | 🔴 CRITICAL |
| `src/routes/_authenticated/kanban.tsx` | 6 | Schema + Type + Cast | 🔴 CRITICAL |
| `src/routes/_authenticated/calendario.tsx` | 3 | Schema + Cast + Type | 🔴 CRITICAL |
| `src/routes/_authenticated/automacao.tsx` | 2 | Schema + Cast | 🔴 CRITICAL |
| `src/routes/_authenticated/integracoes.$clientId.tsx` | 3 | Schema + Cast | 🔴 CRITICAL |
| `src/components/calendar/WeekView.tsx` | 1 | JSX Duplicate | 🟡 MEDIUM |
| `src/__tests__/filters.test.ts` | 5 | Module + Type | 🟡 MEDIUM |

---

## 💡 Key Insights for @dev

1. **Root Cause is Supabase Schema:** 60% of errors come from missing tables/relations
2. **Type Safety Can Wait:** Once schema is fixed, most type errors resolve automatically
3. **No Architectural Changes Needed:** This is pure "make TypeScript happy" work
4. **Sequential Order Matters:** Fix schema FIRST, then types, then JSX/tests
5. **No Regressions Expected:** These are all strict type errors, not logic errors

---

**Status:** Ready for EPIC-01 implementation  
**Next Step:** @pm creates EPIC-01 (TypeScript Health) with 4 stories  
**Then:** @sm drafts stories, @po validates, @dev implements

