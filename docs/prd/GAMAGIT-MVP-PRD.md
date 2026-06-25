# GAMA_CRONOGRAMAS — MVP PRD

**Version:** 1.0.0  
**Status:** ACTIVE  
**Date:** 2026-06-25  
**Product Manager:** @pm (Morgan)  
**Target Release:** 2026-06-26 (Amanhã)

---

## 1. Problem Statement

**Current State:**
- 32 TypeScript errors (any-type spreading across 8 files)
- 7 core routes incomplete/missing (/kanban, /calendario, /clientes, /equipe, /financeiro, /monitoramento, /dashboard)
- 0 tests → unable to validate reliability
- Auth system partially implemented (logout, session persistence missing)
- Post creation flow exists but approval workflow incomplete
- Instagram publishing infrastructure incomplete

**Impact:**
- Build blocked (npm run build FAILS)
- Deployment impossible
- Feature testing unreliable
- Production risk HIGH (no regression coverage)
- User experience broken (missing routes, incomplete flows)

**Stakeholder Pain:**
- Dev team blocked on TypeScript errors (context waste)
- QA unable to test without coverage
- Clients waiting for working platform
- Deployment timeline slipping

---

## 2. Vision

**Mission:**
Create a **production-ready MVP** of GAMA_CRONOGRAMAS platform with stable build, complete routing, robust auth, and Instagram publishing pipeline.

**What It Is:**
- Fully functional timeline/scheduling platform for social media post management
- Multi-client support (Instagram accounts per client)
- Real-time publishing and automation
- Professional UI with dark mode, filters, global navigation

**Success Definition:**
- ✅ `npm run build` → PASS (0 errors, 0 warnings)
- ✅ `npm run lint` → PASS (0 violations)
- ✅ All 7 routes functional and navigable
- ✅ Auth complete (login, logout, session persist, GET /profile)
- ✅ Post creation → approval → publishing end-to-end working
- ✅ Instagram OAuth + publishing via MCP v2 operational
- ✅ Minimum test coverage (unit + integration, 50%+ coverage)
- ✅ Lighthouse scores > 80 (performance, accessibility)

---

## 3. Requirements

### Functional Requirements (FR)

**FR-01: TypeScript Compliance**
- Fix all 32 any-type errors across 8 files
- No `any` type in production code without explicit justification
- Proper type narrowing and type guards
- Type checking passes: `npm run typecheck` with 0 errors

**FR-02: Complete Routing**
- [ ] /dashboard — Overview page (posts, analytics, agenda)
- [ ] /kanban — Board view (stages: draft, scheduled, published)
- [ ] /calendario — Calendar view (week + month, drag-drop)
- [ ] /clientes — Client management (connect, disconnect IG accounts)
- [ ] /equipe — Team collaboration (member roles, permissions)
- [ ] /financeiro — Billing & usage (subscription, invoice, limits)
- [ ] /monitoramento — Instagram insights (real-time metrics)

**FR-03: Authentication**
- Complete login flow (email/password or OAuth)
- Logout functionality
- Session persistence (localStorage + secure HTTP-only cookie)
- GET /profile endpoint with user data
- Protected routes (401/403 for unauthenticated)

**FR-04: Post Creation & Approval**
- Create post (text, images, scheduling)
- Approval workflow (team member approves before publish)
- Comments/feedback thread on posts
- Publish now or schedule for future

**FR-05: Instagram Integration**
- OAuth flow (user connects IG account)
- Store connection (encrypted token)
- MCP v2 publishing (text post, carousel, reels)
- Real-time status sync

**FR-06: Global Features**
- Dark mode toggle (persistent)
- Period selector (week/month/quarter filters)
- Global search (Ctrl+K)
- Profile menu (settings, logout)
- Notifications bell (pending approvals, errors)

### Non-Functional Requirements (NFR)

**NFR-01: Build Quality**
- `npm run build` → 0 errors, 0 warnings
- `npm run lint` → 0 violations
- Bundle size: < 500KB (gzipped)
- No hardcoded credentials in code

**NFR-02: Performance**
- Page load: < 3s (at 4G)
- API response: < 200ms
- Lighthouse scores: >= 80 (all metrics)
- Mobile-first responsive design

**NFR-03: Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation (all interactive elements)
- Screen reader support (semantic HTML)
- Color contrast: 4.5:1 minimum

**NFR-04: Testing**
- Unit tests: 50%+ coverage
- Integration tests: happy path + error cases
- All tests passing: `npm test`
- No flaky tests

**NFR-05: Security**
- HTTPS only (in production)
- CORS configured for OAuth redirect
- Rate limiting (prevent brute force)
- XSS protection (sanitize user input)
- CSRF tokens on state-changing requests

---

## 4. Success Criteria

| Criterion | Metric | Status |
|-----------|--------|--------|
| **Build Quality** | npm run build PASS | ⏳ |
| **Linting** | npm run lint PASS | ⏳ |
| **Type Safety** | 0 TypeScript errors | ⏳ |
| **Test Coverage** | >= 50% | ⏳ |
| **Route Completeness** | 7/7 routes functional | ⏳ |
| **Auth Flow** | Login → Session → Logout working | ⏳ |
| **Instagram Publishing** | End-to-end test with real account | ⏳ |
| **Performance** | Lighthouse > 80 | ⏳ |
| **Accessibility** | WCAG AA pass | ⏳ |

---

## 5. Scope

### IN (Included in MVP)

- ✅ TypeScript type safety (CRITICAL path)
- ✅ 7 core routes fully functional
- ✅ Auth system (login, logout, session)
- ✅ Post creation + approval workflow
- ✅ Instagram OAuth + publishing
- ✅ Dark mode + global filters
- ✅ Basic test coverage (unit + integration)
- ✅ Accessibility audit pass
- ✅ Production build (npm run build PASS)

### OUT (Phase 2+)

- ❌ Advanced analytics (beyond basic IG insights)
- ❌ TikTok, Facebook, LinkedIn integration
- ❌ Bulk scheduling (calendar import)
- ❌ Content AI generation
- ❌ Team collaboration chat
- ❌ Custom domain/white-label
- ❌ API for third-party apps
- ❌ E-commerce integration

---

## 6. Epic Mapping

| Epic | Scope | Effort | Critical? |
|------|-------|--------|-----------|
| **EPIC-01** | TypeScript Compliance | 4h | ✅ YES |
| **EPIC-02** | Auth & Session System | 3h | ✅ YES |
| **EPIC-03** | Core Routes | 8h | ✅ YES |
| **EPIC-04** | Post Creation & Approval | 6h | ✅ YES |
| **EPIC-05** | Instagram Publishing | 3h | ✅ YES |
| **EPIC-06** | Tests & Coverage | 6h | ❌ Medium |
| **EPIC-07** | Performance & A11y | 4h | ❌ Medium |

**Total Effort:** 34 hours (MVP achievable in 2 days)

---

## 7. Dependencies & Risks

### Dependencies
- **External:** Meta/Instagram Graph API (OAuth, publishing)
- **Internal:** MCP v2 (Instagram publishing infrastructure)
- **User Action:** Setup Meta app (30min, scheduled for tomorrow morning)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| IG App approval delay | Blocks publishing | LOW | Use test account from Meta |
| OAuth redirect URI mismatch | Auth fails | MEDIUM | Pre-configure URI in .env |
| Token expiration during test | Publishing fails | HIGH | Implement refresh token handler |
| Performance issues under load | UX degradation | MEDIUM | Implement caching + lazy loading |
| Missing test data | Can't validate | MEDIUM | Create seed data for testing |

---

## 8. Timeline

```
TODAY (2026-06-25):
  ✅ Epic A, B, C — DONE (previous sessions)
  ✅ Epic E, F — 95% DONE (overnight loop)
  ⏳ Epic D — BLOCKED (user action needed)

TOMORROW (2026-06-26):
  09:00 — User setup Meta (30min)
  09:45 — Begin integration testing (30min)
  10:15 — Final deployment (15min)
  10:30 — MVP LIVE 🚀

EPICS EXECUTION ORDER:
  1. EPIC-01 (TypeScript) — 4h [CRITICAL]
  2. EPIC-02 (Auth) — 3h
  3. EPIC-03 (Routes) — 8h
  4. EPIC-04 (Post/Approval) — 6h
  5. EPIC-05 (IG Publishing) — 3h
  6. EPIC-06 (Tests) — 6h [PARALLEL]
  7. EPIC-07 (Perf/A11y) — 4h [PARALLEL]
```

---

## 9. Acceptance Criteria (Release Gate)

- [ ] `npm run build` → exit code 0
- [ ] `npm run lint` → exit code 0
- [ ] `npm run typecheck` → exit code 0
- [ ] `npm test` → all tests PASS
- [ ] All 7 routes navigable in browser
- [ ] Login → Create Post → Approve → Publish flow works end-to-end
- [ ] Instagram OAuth callback returns account data
- [ ] Dark mode toggle persists
- [ ] No console errors (red 🔴)
- [ ] Lighthouse audit score >= 80
- [ ] WCAG AA validation PASS

---

## 10. Post-MVP (Phase 2)

**Roadmap (30-60 days):**
- Epic G: Portal Cliente (white-label client view)
- Epic H: Real-time Monitoring (WebSocket IG insights)
- Epic I: Error Notifications (email/SMS alerts)
- Epic J: Publishing Analytics (ROI per post)
- Epic K: Bulk Scheduling (import from CSV/calendar)

---

## Sign-Off

| Role | Name | Date | Sign-Off |
|------|------|------|----------|
| Product Manager | @pm (Morgan) | 2026-06-25 | ✅ |
| Technical Lead | @architect (Aria) | TBD | ⏳ |
| QA Lead | @qa (Quinn) | TBD | ⏳ |

---

**Document Owner:** @pm (Morgan)  
**Last Updated:** 2026-06-25 15:30 UTC  
**Next Review:** 2026-06-26 (post-deployment)
