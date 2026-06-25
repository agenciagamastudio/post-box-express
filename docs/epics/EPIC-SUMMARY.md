# Epic Summary — GAMA_CRONOGRAMAS MVP

**Status:** All 7 Epics Created ✅  
**Date:** 2026-06-25  
**Product Manager:** @pm (Morgan)  
**Total Effort:** 34 hours  
**Timeline:** 2 days (with parallel execution)

---

## Quick Reference

| Epic | Name | Priority | Effort | Owner | Status |
|------|------|----------|--------|-------|--------|
| **E-01** | TypeScript Compliance | CRITICAL | 4h | @dev | DRAFT |
| **E-02** | Auth & Session | CRITICAL | 3h | @dev | DRAFT |
| **E-03** | Core Routes (7 routes) | CRITICAL | 8h | @dev | DRAFT |
| **E-04** | Post Creation & Approval | CRITICAL | 6h | @dev | DRAFT |
| **E-05** | Instagram Publishing | CRITICAL | 3h | @dev | DRAFT |
| **E-06** | Tests & Coverage | MEDIUM | 6h | @qa | DRAFT |
| **E-07** | Performance & A11y | MEDIUM | 4h | @dev+@qa | DRAFT |

**Total:** 34h | **Parallel Ready:** Yes (E-06/07 can run simultaneously)

---

## Execution Order

### Phase 1: Sequential (Critical Path) — 24h
```
EPIC-01 (4h) → EPIC-02 (3h) → EPIC-03 (8h) → EPIC-04 (6h) → EPIC-05 (3h)
```

### Phase 2: Parallel (Quality) — 6h (overlap with Phase 1)
```
EPIC-06 (6h) ║ EPIC-07 (4h)   ← Start after EPIC-03
```

**Effective Timeline:** 16-18h (with parallelism)

---

## EPIC-01: TypeScript Compliance

**What:** Fix 32 `any`-type errors in 8 files  
**Why:** Unblocks `npm run build`  
**How:** Type all Graph API responses, component props, hooks, utilities  
**Effort:** 4h  

**Files:**
- instagram.ts (8 errors)
- PostCard.tsx (5 errors)
- useInstagramData.ts (6 errors)
- post.ts (3 errors)
- client.ts (4 errors)
- validators.ts (2 errors)
- AuthContext.tsx (2 errors)
- auth.ts (2 errors)

**Stories:** 4 stories (service, components, types, middleware)

---

## EPIC-02: Auth & Session

**What:** Complete login/logout, session persistence  
**Why:** Enables protected routes, user context  
**How:** Email/password auth (no OAuth for MVP), localStorage + HTTP-only cookie  
**Effort:** 3h  

**Stories:** 3 stories (login form, session persist, logout + protected routes)

---

## EPIC-03: Core Routes (7 routes)

**What:** Implement all 7 main routes  
**Why:** Complete platform navigation  
**How:** Dedicated page component per route, mock data, API scaffolding  
**Effort:** 8h  

**Routes:**
1. /dashboard — Overview + metrics
2. /kanban — Board view (stages)
3. /calendario — Calendar (week/month)
4. /clientes — Client management
5. /equipe — Team collaboration
6. /financeiro — Billing
7. /monitoramento — IG insights

**Stories:** 5 stories (grouped routes)

---

## EPIC-04: Post Creation & Approval

**What:** Full post creation + team approval workflow  
**Why:** Core business logic  
**How:** Form (text, images, schedule) → Draft → Approval → Scheduled  
**Effort:** 6h  

**Stories:** 4 stories (form, approval queue, comments, DB integration)

---

## EPIC-05: Instagram Publishing

**What:** Publish approved posts to IG  
**Why:** Core product value  
**How:** Scheduled + manual publishing via IG Graph API  
**Effort:** 3h  

**Stories:** 3 stories (scheduled, manual, error handling)

---

## EPIC-06: Tests & Coverage

**What:** Achieve 50%+ test coverage  
**Why:** Prevent regressions  
**How:** Unit tests (utilities, hooks) + integration tests (critical flows)  
**Effort:** 6h  
**Status:** Can run in parallel (after code exists)

**Stories:** 3 stories (unit tests, integration, coverage + CI/CD)

---

## EPIC-07: Performance & Accessibility

**What:** Lighthouse > 80 + WCAG AA compliance  
**Why:** User experience + inclusivity  
**How:** Code splitting, image optimization, keyboard nav, screen reader support  
**Effort:** 4h  
**Status:** Can run in parallel

**Stories:** 3 stories (perf, a11y audit, responsive)

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| npm run build | PASS | ⏳ |
| npm run lint | PASS | ⏳ |
| npm run typecheck | PASS (0 errors) | ⏳ |
| Test Coverage | >= 50% | ⏳ |
| All 7 Routes | Functional | ⏳ |
| Auth Flow | Login → Session → Logout | ⏳ |
| IG Publishing | End-to-end working | ⏳ |
| Lighthouse Score | >= 80 | ⏳ |
| WCAG AA | Pass audit | ⏳ |

---

## Dependencies

```
EPIC-01 (TypeScript)
  ↓
EPIC-02 (Auth) ← needs typed code
  ↓
EPIC-03 (Routes) ← needs auth for protected routes
  ├→ EPIC-04 (Post/Approval) ← needs /automacao route
  │   ↓
  │   EPIC-05 (Publishing) ← needs approved posts
  │
  └→ EPIC-06 (Tests) [PARALLEL]
     EPIC-07 (Perf/A11y) [PARALLEL after EPIC-03]
```

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| TS fixes cause regression | HIGH | MEDIUM | Run full test suite after each file |
| Auth not complete in time | HIGH | LOW | Scope to email/password only (no OAuth) |
| Routes development delays | MEDIUM | LOW | Use template layout for reusability |
| IG API failures | HIGH | MEDIUM | Use Meta test account + retry logic |
| Performance issues | MEDIUM | MEDIUM | Profile bundle size + lazy loading |
| A11y compliance gaps | MEDIUM | MEDIUM | Use axe DevTools + keyboard testing |

---

## Resources

| Document | Purpose | Location |
|----------|---------|----------|
| PRD | Comprehensive requirements | `docs/prd/GAMAGIT-MVP-PRD.md` |
| EPIC-01 | TypeScript details | `docs/epics/EPIC-01-typescript-compliance.md` |
| EPIC-02 | Auth details | `docs/epics/EPIC-02-auth-session.md` |
| EPIC-03 | Routes details | `docs/epics/EPIC-03-core-routes.md` |
| EPIC-04 | Post/Approval details | `docs/epics/EPIC-04-post-creation-approval.md` |
| EPIC-05 | Publishing details | `docs/epics/EPIC-05-instagram-publishing.md` |
| EPIC-06 | Tests details | `docs/epics/EPIC-06-tests-coverage.md` |
| EPIC-07 | Perf/A11y details | `docs/epics/EPIC-07-perf-a11y.md` |
| Decision Log | PM decisions | `docs/qa/decision-logs/decision-log-2026-06-25.md` |

---

## Next Steps

1. ✅ PRD + Epics created (this session)
2. ⏳ User completes Meta setup (tomorrow morning, 30min)
3. ⏳ @dev begins EPIC-01 execution (tomorrow, after Meta setup)
4. ⏳ @qa parallel track EPIC-06 (tomorrow, after core code exists)
5. ⏳ Final validation + deployment (tomorrow afternoon)

---

## Summary

**What:** MVP platform for scheduling + publishing Instagram posts  
**How:** 7 structured epics, 5 critical, 2 parallel quality tracks  
**Why:** Clear product vision, quantifiable success, manageable scope  
**When:** Ready for execution tomorrow morning after Meta setup  
**Who:** @dev (implementation), @qa (testing), @pm (orchestration)

**Status: READY FOR EXECUTION** 🚀

---

**Document Owner:** @pm (Morgan)  
**Created:** 2026-06-25 16:00 UTC  
**Approval:** ✅ APPROVED BY PM
