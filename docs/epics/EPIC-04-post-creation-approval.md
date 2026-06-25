# EPIC-04: Post Creation & Approval

**Status:** DRAFT  
**Priority:** CRITICAL  
**Effort:** 6h  
**Owner:** @dev (Dex)

---

## Objective

Complete post creation flow with approval workflow. Users can create posts, other team members approve/reject, and approved posts move to publishing queue.

---

## Acceptance Criteria

- [ ] Create post form (text, images, scheduling, IG account)
- [ ] Post saved as draft
- [ ] Approval request sent to team member
- [ ] Approver sees pending posts and can approve/reject
- [ ] Approved posts move to "scheduled" status
- [ ] Comments/feedback thread on posts during approval
- [ ] Notifications sent on approval state changes

---

## Stories

### Story 04.1: Post Creation Form (2h)

**Description:**
Build form for creating posts.

**AC:**
- [ ] Form captures: title, caption, images, schedule date/time
- [ ] Select IG account to publish to
- [ ] Save as draft
- [ ] Form validation (required fields, image size)
- [ ] Success message after save

---

### Story 04.2: Approval Queue (2h)

**Description:**
Implement approval workflow and queue.

**AC:**
- [ ] Pending posts displayed in approval view
- [ ] Approver can view full post details
- [ ] Approve/Reject buttons with optional comment
- [ ] Approved posts move to "scheduled" status
- [ ] Rejected posts return to draft for revision

---

### Story 04.3: Comments & Notifications (1.5h)

**Description:**
Add feedback thread and notifications.

**AC:**
- [ ] Comment thread on posts during approval
- [ ] Notifications on approval state changes
- [ ] Comments persist and visible to all team members

---

### Story 04.4: Database Integration (0.5h)

**Description:**
Ensure post data persists correctly.

**AC:**
- [ ] Posts saved to database
- [ ] Status transitions tracked
- [ ] Approval audit trail logged

---

## Dependencies

- ⬅️ EPIC-01 (TypeScript)
- ⬅️ EPIC-02 (Auth) — need user context
- ⬅️ EPIC-03 (Routes) — need /automacao route

---

## Definition of Done

- ✅ Post creation flow 100% working
- ✅ Approval workflow functional
- ✅ Data persists correctly
- ✅ Notifications sent appropriately
- ✅ Tests passing (create, approve, reject scenarios)

---

## Notes

- Coordinate with EPIC-05 (publishing needs approved posts)
- Approval workflow: draft → pending approval → approved → scheduled → published
