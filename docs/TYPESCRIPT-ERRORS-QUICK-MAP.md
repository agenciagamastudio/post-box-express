# ⚡ TypeScript Errors — Quick Visual Map

**Total:** 32 errors | **Build Status:** 🔴 BLOCKED  
**Root Cause:** Supabase schema + type mismatch | **Fix Time:** ~4-5h

---

## 🗺️ Error Distribution Map

```
TOTAL ERRORS (32)
│
├─ 🔴 CRITICAL (20 errors)
│  │
│  ├─ Supabase Schema Issues (12 errors)
│  │  ├─ "publish_log" table missing → 4 errors
│  │  ├─ "post_reviews" table missing → 4 errors
│  │  └─ Missing columns/relations → 4 errors
│  │
│  └─ Type Casting Without Error Handling (8 errors)
│     ├─ automacao.tsx: line 47
│     ├─ calendario.tsx: line 97
│     ├─ integracoes.$clientId.tsx: line 102
│     └─ kanban.tsx: multiple locations
│
├─ 🟠 HIGH (10 errors)
│  │
│  ├─ null vs undefined mismatches → 4 errors
│  │  └─ useNotifications.ts, filters.test.ts
│  │
│  ├─ Incompatible callback types → 2 errors
│  │  └─ calendario.tsx: WeekView Post type mismatch
│  │
│  └─ Union type property access → 4 errors
│     └─ Trying to access properties on SelectQueryError
│
└─ 🟡 MEDIUM (2 errors)
   │
   ├─ JSX duplicate attributes → 1 error
   │  └─ WeekView.tsx: line 60
   │
   └─ Missing test dependency → 1 error
      └─ vitest not installed
```

---

## 🎯 Files Affected (by severity)

### 🔴 CRITICAL Path (5 files)

```
src/hooks/
├─ useNotifications.ts (5 errors) ⚠️ WORST
│  └─ publish_log table missing
│  └─ Type mismatches (null vs undefined)
│
src/routes/_authenticated/
├─ kanban.tsx (6 errors) ⚠️ WORST
│  └─ post_reviews missing
│  └─ Unsafe type casts
│  └─ Missing properties on error
│
├─ calendario.tsx (3 errors)
│  └─ post_reviews missing
│  └─ Type callback mismatch with WeekView
│
├─ automacao.tsx (2 errors)
│  └─ publish_log missing
│  └─ Unsafe type cast
│
└─ integracoes.$clientId.tsx (3 errors)
   └─ publish_log missing
   └─ Unsafe type cast
```

### 🟡 MEDIUM Priority (2 files)

```
src/components/calendar/
├─ WeekView.tsx (1 error)
   └─ Duplicate JSX attribute on line 60

src/__tests__/
├─ filters.test.ts (5 errors)
   └─ Missing vitest dependency
   └─ Array type inference issues
```

---

## 📊 Error Categories & Quick Fixes

### Category 1: Supabase Schema (BLOCKER)

| Issue | Fix | Time |
|-------|-----|------|
| `publish_log` table missing | Create table in Supabase | 30min |
| `post_reviews` table missing | Create table in Supabase | 30min |
| Regenerate types | `npx supabase gen types typescript` | 10min |

**Result:** Eliminates 12 errors in one shot ✨

---

### Category 2: Type Unification (CRITICAL)

| Issue | Fix | Time |
|-------|-----|------|
| Two different `Post` types | Create single `src/types/post.ts` | 20min |
| Import everywhere | Update 5 files | 20min |
| Type callback mismatch | Align WeekView with calendario Post type | 30min |

**Result:** Eliminates 4 errors

---

### Category 3: Error Handling (HIGH)

| Issue | Fix | Time |
|-------|-----|------|
| Unsafe `as Post[]` cast | Add `if (error) throw error` before cast | 40min |
| null vs undefined mismatch | Update interface definitions | 30min |
| Property access on error | Add type guard before access | 20min |

**Result:** Eliminates 8 errors

---

### Category 4: Cleanup (MEDIUM)

| Issue | Fix | Time |
|-------|-----|------|
| Duplicate JSX attribute | Find & remove duplicate attribute | 10min |
| Missing vitest | `npm install --save-dev vitest` | 15min |
| Test type errors | Update array typing | 15min |

**Result:** Eliminates 2 errors

---

## 🚀 Implementation Sequence (Correct Order!)

```
STEP 1: Supabase Schema (30-40min)
   ↓
   Fix publish_log + post_reviews + regenerate types
   Result: 12 errors gone ✅
   
STEP 2: Type Unification (20-30min)
   ↓
   Create unified Post type
   Result: 4 more errors gone ✅
   
STEP 3: Error Handling (40-50min)
   ↓
   Add proper error checks, remove unsafe casts
   Result: 8 more errors gone ✅
   
STEP 4: Cleanup (40min)
   ↓
   Fix JSX, install vitest, fix tests
   Result: 2 more errors gone ✅
   
FINAL: Build Check
   ↓
   npm run build → SUCCESS 🎉
```

---

## 📋 Checklist (Copy-Paste Ready)

```markdown
EPIC-01: TypeScript Health

Story 1.1: Fix Supabase Schema
- [ ] Create publish_log table (id, status, provider, external_id, message, created_at, updated_at)
- [ ] Create post_reviews table (id, post_id FK, reviewer_id FK, comment, status, created_at)
- [ ] Regenerate Supabase types: npx supabase gen types typescript
- [ ] Commit: "fix(schema): add missing tables publish_log and post_reviews"

Story 1.2: Unify Post Type
- [ ] Create src/types/post.ts with canonical Post interface
- [ ] Update calendario.tsx to import Post from types
- [ ] Update kanban.tsx to import Post from types
- [ ] Update WeekView.tsx to import Post from types
- [ ] Remove duplicate type definitions
- [ ] Commit: "refactor(types): unify Post type definition"

Story 1.3: Fix Error Handling
- [ ] Add error checks before `as` type casts (automacao, calendario, integracoes, kanban)
- [ ] Update useNotifications (null vs undefined)
- [ ] Update callback types
- [ ] Commit: "fix(types): add error handling and fix type mismatches"

Story 1.4: Cleanup & Verify
- [ ] Fix WeekView.tsx duplicate attribute on line 60
- [ ] npm install --save-dev vitest @vitest/ui
- [ ] Update tsconfig.json with vitest types
- [ ] Fix filters.test.ts array types
- [ ] npm run build → PASS ✅
- [ ] npm run lint → PASS ✅
- [ ] Commit: "fix(build): resolve JSX and test errors"
```

---

## 📊 Before/After

```
BEFORE:
  npm run build
  error TS2307: Cannot find module 'vitest'
  error TS2339: Property 'id' does not exist...
  error TS2352: Conversion of type '...' may be a mistake...
  [32 errors total]
  ❌ BUILD FAILED

AFTER (EPIC-01 complete):
  npm run build
  ✅ built in 2.3s
  
  npm run lint
  ✅0 problems
  
  npm run typecheck
  ✅ No errors
  
  npm test
  ✅ PASS (all suites)
  
  ✅ MVP READY FOR NEXT EPIC
```

---

## 🔥 Hot Takes

| Aspect | Status |
|--------|--------|
| **Is this a big refactor?** | No — pure type fixing |
| **Will it break features?** | No — logic unchanged |
| **Can it be automated?** | ~70% (rest is careful manual work) |
| **Skill required?** | Intermediate TypeScript knowledge |
| **Risk level?** | Low — easy to verify (build passes) |
| **Estimated completion** | 4-5 hours for @dev |

---

## 📞 When You're Stuck

1. **Error about publish_log?** → Table doesn't exist in Supabase → Create it
2. **Error about post_reviews?** → Same → Create it
3. **Error about type cast?** → Add `if (error)` check before `as`
4. **Error about null vs undefined?** → Change interface type
5. **JSX error about duplicate attribute?** → Search `WeekView.tsx:60` → Remove duplicate

---

**Status:** ✅ Analysis Complete | Ready for @pm → @sm → @po → @dev pipeline  
**Next Step:** Create EPIC-01 document for @pm  
**Time to Clear Blocker:** 4-5 hours (1 developer)

