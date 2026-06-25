# EPIC-02: Auth & Session System

**Status:** DRAFT  
**Priority:** CRITICAL  
**Effort:** 3h  
**Owner:** @dev (Dex)

---

## Objective

Complete authentication and session management system. Users can login, maintain session across page reloads, and logout cleanly.

---

## Acceptance Criteria

- [ ] Login flow (email/password or OAuth)
- [ ] Session persists on page reload (localStorage + HTTP-only cookie)
- [ ] Logout clears session completely
- [ ] GET /profile returns authenticated user data
- [ ] Protected routes redirect to login if unauthenticated
- [ ] 401/403 errors handled gracefully

---

## Stories

### Story 02.1: Login Implementation (1.5h)

**Description:**
Implement login page and API integration.

**AC:**
- [ ] Login form with email/password fields
- [ ] POST /auth/login endpoint
- [ ] Token stored securely (HTTP-only cookie)
- [ ] Validation feedback (invalid credentials)
- [ ] Redirect to dashboard on success

---

### Story 02.2: Session Persistence (1h)

**Description:**
Maintain session across page reloads.

**AC:**
- [ ] Session data stored in localStorage + cookie
- [ ] App initializes with GET /profile on mount
- [ ] Session restored if valid
- [ ] User context populated from session

---

### Story 02.3: Logout & Protected Routes (0.5h)

**Description:**
Complete logout flow and protect routes.

**AC:**
- [ ] Logout button clears all session data
- [ ] Protected routes redirect to login
- [ ] Auth middleware prevents unauthorized access

---

## Dependencies

- ⬅️ EPIC-01 (TypeScript Compliance) — must complete first

---

## Definition of Done

- ✅ Auth system 100% functional
- ✅ Session persists correctly
- ✅ All routes protected as needed
- ✅ Tests passing (unit + integration)

---

## Notes

- Coordinate with EPIC-03 (Routes need auth integration)
- User account data from user table
