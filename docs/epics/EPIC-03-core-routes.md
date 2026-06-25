# EPIC-03: Core Routes

**Status:** DRAFT  
**Priority:** CRITICAL  
**Effort:** 8h  
**Owner:** @dev (Dex)

---

## Objective

Implement and complete all 7 core routes. Each route is navigable, populated with mock/real data, and integrated with backend API.

---

## Routes to Complete

1. **/dashboard** — Overview (posts, metrics, agenda)
2. **/kanban** — Board view (stages: draft, scheduled, published)
3. **/calendario** — Calendar (week/month view, drag-drop)
4. **/clientes** — Client management (IG account connections)
5. **/equipe** — Team collaboration (members, roles)
6. **/financeiro** — Billing & usage (subscription, invoices)
7. **/monitoramento** — IG insights (real-time metrics)

---

## Acceptance Criteria

- [ ] All 7 routes accessible from navigation
- [ ] Each route has dedicated page component
- [ ] Pages load without errors
- [ ] Navigation between routes works
- [ ] Route parameters handled correctly
- [ ] Data fetching integrated (mock or real API)
- [ ] Loading states and error handling shown

---

## Stories

### Story 03.1: Dashboard Route (1.5h)

**Description:**
Implement /dashboard with overview cards (posts count, IG followers, scheduled posts).

**AC:**
- [ ] Route defined in router config
- [ ] Dashboard component renders
- [ ] Cards display mock data
- [ ] API integration scaffolded

---

### Story 03.2: Kanban Board (2h)

**Description:**
Implement /kanban with drag-drop board (stages: draft, scheduled, published).

**AC:**
- [ ] Kanban board renders 3 columns
- [ ] Posts display as cards
- [ ] Drag-drop moves cards between columns
- [ ] State updates on drop

---

### Story 03.3: Calendar (2h)

**Description:**
Implement /calendario with week and month view.

**AC:**
- [ ] Calendar component renders
- [ ] Week view shows 7-day timeline
- [ ] Month view shows all days
- [ ] Toggle between views works

---

### Story 03.4: Clients & Team Routes (1.5h)

**Description:**
Implement /clientes and /equipe.

**AC:**
- [ ] /clientes shows client list
- [ ] Connect IG account button visible
- [ ] /equipe shows team members
- [ ] Add member form present

---

### Story 03.5: Financeiro & Monitoring Routes (1h)

**Description:**
Implement /financeiro and /monitoramento.

**AC:**
- [ ] /financeiro displays subscription status
- [ ] /monitoramento shows IG metrics (mock)

---

## Dependencies

- ⬅️ EPIC-01 (TypeScript) — must complete
- ⬅️ EPIC-02 (Auth) — must complete for protected routes

---

## Definition of Done

- ✅ All 7 routes functional and navigable
- ✅ No console errors
- ✅ Layout consistent across routes
- ✅ Top bar (notifications, period, profile) visible on all pages
- ✅ Mobile responsive

---

## Notes

- Use shared layout component for consistency
- Leverage existing UI components (top bar, sidebar)
- Mock data for routes not yet integrated with backend
