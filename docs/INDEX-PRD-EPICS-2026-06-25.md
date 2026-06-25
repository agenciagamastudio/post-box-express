# Index — PRD + Epics (2026-06-25)

**Date:** 2026-06-25  
**Product Manager:** @pm (Morgan)  
**Status:** ✅ COMPLETE

---

## 📌 Start Here

**First Time?** Read in this order:

1. **[PM-SESSION-STATUS-2026-06-25.md](../PM-SESSION-STATUS-2026-06-25.md)** ← Overview of what was done
2. **[docs/prd/GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md)** ← Full PRD (requirements, timeline)
3. **[docs/epics/EPIC-SUMMARY.md](epics/EPIC-SUMMARY.md)** ← Quick reference (all 7 epics at a glance)

---

## 📄 Core Documents

### Product Requirements Document (PRD)

| File | Purpose | Read Time |
|------|---------|-----------|
| [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) | Complete MVP requirements, success criteria, timeline, risks | 15 min |

**Contains:**
- Problem statement
- Vision & business value
- Functional + non-functional requirements
- Success criteria (quantifiable)
- Scope (IN / OUT)
- 7 Epic mapping
- Dependencies & risks
- Timeline & acceptance criteria
- Post-MVP roadmap

---

## 📊 Epics (7 Total)

### CRITICAL Epics (5 × Must complete for MVP)

| Epic | Title | Effort | File | Read Time |
|------|-------|--------|------|-----------|
| **E-01** | TypeScript Compliance | 4h | [EPIC-01-typescript-compliance.md](epics/EPIC-01-typescript-compliance.md) | 5 min |
| **E-02** | Auth & Session System | 3h | [EPIC-02-auth-session.md](epics/EPIC-02-auth-session.md) | 4 min |
| **E-03** | Core Routes (7 routes) | 8h | [EPIC-03-core-routes.md](epics/EPIC-03-core-routes.md) | 6 min |
| **E-04** | Post Creation & Approval | 6h | [EPIC-04-post-creation-approval.md](epics/EPIC-04-post-creation-approval.md) | 6 min |
| **E-05** | Instagram Publishing | 3h | [EPIC-05-instagram-publishing.md](epics/EPIC-05-instagram-publishing.md) | 4 min |

### MEDIUM Epics (2 × Can run in parallel)

| Epic | Title | Effort | File | Read Time |
|------|-------|--------|------|-----------|
| **E-06** | Tests & Coverage | 6h | [EPIC-06-tests-coverage.md](epics/EPIC-06-tests-coverage.md) | 5 min |
| **E-07** | Performance & A11y | 4h | [EPIC-07-perf-a11y.md](epics/EPIC-07-perf-a11y.md) | 5 min |

---

## 🗂️ Quick Reference

| Document | Purpose | For Whom |
|----------|---------|----------|
| [EPIC-SUMMARY.md](epics/EPIC-SUMMARY.md) | One-page overview of all 7 epics | Everyone (quick reference) |
| [decision-log-2026-06-25.md](qa/decision-logs/decision-log-2026-06-25.md) | Why each decision was made | PM, architects, stakeholders |
| [PM-SESSION-STATUS-2026-06-25.md](../PM-SESSION-STATUS-2026-06-25.md) | What @pm delivered in this session | Stakeholders, next PM |

---

## 🎯 For Different Roles

### For @dev (Developer)

**Read in order:**
1. [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) — Understand MVP requirements (10 min)
2. [EPIC-SUMMARY.md](epics/EPIC-SUMMARY.md) — Overview of all 7 epics (5 min)
3. Specific epic you're assigned to:
   - [EPIC-01-typescript-compliance.md](epics/EPIC-01-typescript-compliance.md) — If fixing types
   - [EPIC-02-auth-session.md](epics/EPIC-02-auth-session.md) — If doing auth
   - [EPIC-03-core-routes.md](epics/EPIC-03-core-routes.md) — If building routes
   - [EPIC-04-post-creation-approval.md](epics/EPIC-04-post-creation-approval.md) — If building post flow
   - [EPIC-05-instagram-publishing.md](epics/EPIC-05-instagram-publishing.md) — If doing IG publishing

**Then execute:** Each epic has stories with clear acceptance criteria

---

### For @qa (QA/Testing)

**Read in order:**
1. [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) — Understand success criteria (10 min)
2. [EPIC-SUMMARY.md](epics/EPIC-SUMMARY.md) — Overview (5 min)
3. [EPIC-06-tests-coverage.md](epics/EPIC-06-tests-coverage.md) — Testing requirements (5 min)
4. [EPIC-07-perf-a11y.md](epics/EPIC-07-perf-a11y.md) — Performance & accessibility (5 min)

**Then execute:** Run parallel testing while dev is implementing

---

### For Stakeholders / Product Leadership

**Read in order:**
1. [PM-SESSION-STATUS-2026-06-25.md](../PM-SESSION-STATUS-2026-06-25.md) — What happened (5 min)
2. [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) — Full requirements & timeline (15 min)
3. [decision-log-2026-06-25.md](qa/decision-logs/decision-log-2026-06-25.md) — Key decisions (10 min)

**Result:** Clear understanding of MVP scope, timeline, success criteria, risks

---

### For Next PM Session

**Read in order:**
1. [PM-SESSION-STATUS-2026-06-25.md](../PM-SESSION-STATUS-2026-06-25.md) — What was delivered
2. [decision-log-2026-06-25.md](qa/decision-logs/decision-log-2026-06-25.md) — Decisions & context
3. [EPIC-SUMMARY.md](epics/EPIC-SUMMARY.md) — Current epic status

**Then:** Continue with next phase based on completion status

---

## 📂 File Structure

```
docs/
├── prd/
│   └── GAMAGIT-MVP-PRD.md              ← PRD (full requirements)
│
├── epics/
│   ├── EPIC-SUMMARY.md                 ← Quick reference (all 7 epics)
│   ├── EPIC-01-typescript-compliance.md
│   ├── EPIC-02-auth-session.md
│   ├── EPIC-03-core-routes.md
│   ├── EPIC-04-post-creation-approval.md
│   ├── EPIC-05-instagram-publishing.md
│   ├── EPIC-06-tests-coverage.md
│   └── EPIC-07-perf-a11y.md
│
└── qa/
    └── decision-logs/
        └── decision-log-2026-06-25.md  ← PM decisions & rationale

PROJECT_ROOT/
├── PM-SESSION-STATUS-2026-06-25.md     ← Session summary
└── docs/INDEX-PRD-EPICS-2026-06-25.md  ← This file
```

---

## 🚀 Execution Sequence

```
TOMORROW (2026-06-26):

Morning:
  09:00 — User sets up Meta (30min)
  09:30 — @dev starts EPIC-01 (TypeScript, 4h)

Afternoon:
  13:30 — @dev starts EPIC-02 (Auth, 3h)
  13:30 — @qa starts EPIC-06 (Tests, parallel, 6h)
  16:30 — @dev starts EPIC-03 (Routes, 8h)
          @qa starts EPIC-07 (Perf/A11y, 4h)

Later:
  @dev does EPIC-04 (Post/Approval, 6h)
  @dev does EPIC-05 (Publishing, 3h)

Evening/Next Day:
  Final validation + deployment
```

**Total:** 34h work, ~16-18h wall-clock time (with parallelism)

---

## ✅ Success Criteria (Release Gate)

All of these must be TRUE before shipping MVP:

- [ ] `npm run build` → exit code 0
- [ ] `npm run lint` → exit code 0
- [ ] `npm run typecheck` → exit code 0
- [ ] `npm test` → all tests PASS
- [ ] All 7 routes navigable (dashboard, kanban, calendario, clientes, equipe, financeiro, monitoramento)
- [ ] Auth flow complete (login → session persist → logout)
- [ ] Post creation → approval → publishing end-to-end working
- [ ] Instagram OAuth + publishing tested with real IG account
- [ ] Dark mode toggle working + persists
- [ ] No console errors (red 🔴)
- [ ] Lighthouse audit score >= 80 (all metrics)
- [ ] WCAG 2.1 AA compliance verified

---

## 📞 Questions?

**Q: Where do I start?**  
A: If new to this project, read [PM-SESSION-STATUS-2026-06-25.md](../PM-SESSION-STATUS-2026-06-25.md) first.

**Q: What's the MVP scope?**  
A: See [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) section 5 (Scope).

**Q: Which epic do I work on?**  
A: See [EPIC-SUMMARY.md](epics/EPIC-SUMMARY.md) table. Pick your epic and read the file.

**Q: What's the timeline?**  
A: 2 days. See [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) section 8 (Timeline).

**Q: What are the success criteria?**  
A: See above, or [GAMAGIT-MVP-PRD.md](prd/GAMAGIT-MVP-PRD.md) section 4 & 9.

**Q: What if something is blocked?**  
A: See [decision-log-2026-06-25.md](qa/decision-logs/decision-log-2026-06-25.md) for risk mitigations.

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Total Files Created | 10 |
| Total Lines Written | ~1,420 |
| Epics | 7 |
| Stories | 25 |
| Total Effort | 34h |
| Effective Timeline | 16-18h (with parallelism) |
| Success Criteria | 12 quantifiable gates |
| Risks Identified | 5 + mitigations |

---

## ✨ Summary

This folder contains everything needed to execute GAMA_CRONOGRAMAS MVP:

1. **Strategy** (PRD) ← What we're building
2. **Breakdown** (7 Epics) ← How we'll build it
3. **Reference** (EPIC-SUMMARY) ← Quick guide
4. **Decisions** (decision-log) ← Why we decided this way
5. **Status** (PM-SESSION-STATUS) ← What's done

**Everything is ready for execution.** 🚀

---

**Document Owner:** @pm (Morgan)  
**Created:** 2026-06-25  
**Last Updated:** 2026-06-25 16:00 UTC  
**Status:** ✅ READY FOR EXECUTION

**Next Action:** Await user Meta setup signal tomorrow morning, then @dev begins EPIC-01.
