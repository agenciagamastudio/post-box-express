# EPIC-05: Instagram Publishing

**Status:** DRAFT  
**Priority:** CRITICAL  
**Effort:** 3h  
**Owner:** @dev (Dex)

---

## Objective

Implement end-to-end Instagram publishing. Approved posts are published to IG via Graph API at scheduled time or manually. Real-time status sync.

---

## Acceptance Criteria

- [ ] Scheduled posts published at correct time (cron job)
- [ ] Manual "Publish Now" button works
- [ ] Post published to connected IG account
- [ ] Post status updated to "published"
- [ ] Failure handling (network, IG API errors)
- [ ] Token refresh if expired
- [ ] Real-time status visible in UI

---

## Stories

### Story 05.1: Scheduled Publishing (1.5h)

**Description:**
Implement cron job for scheduled publishing.

**AC:**
- [ ] Cron job checks for posts at scheduled time
- [ ] IG Graph API called via MCP v2
- [ ] Post published to IG
- [ ] Status updated to "published"
- [ ] IG post ID stored for tracking

---

### Story 05.2: Manual Publishing (0.5h)

**Description:**
Add "Publish Now" button for immediate publishing.

**AC:**
- [ ] Button triggers publish API endpoint
- [ ] Post published immediately
- [ ] Confirmation shown to user

---

### Story 05.3: Error Handling & Retries (1h)

**Description:**
Handle failures and retry logic.

**AC:**
- [ ] Network errors retried (3x with backoff)
- [ ] IG API errors logged
- [ ] User notified of failures
- [ ] Manual retry available
- [ ] Expired tokens refreshed automatically

---

## Dependencies

- ⬅️ EPIC-04 (Post Creation & Approval) — need approved posts
- ⬅️ MCP v2 (Instagram publishing infrastructure) — prerequisite

---

## Definition of Done

- ✅ Publishing flow end-to-end working
- ✅ Scheduled posts publish correctly
- ✅ Manual publishing works
- ✅ Errors handled gracefully
- ✅ Status sync real-time
- ✅ Tests passing (mock IG API)

---

## Notes

- Use existing MCP v2 infrastructure (do not reimplement)
- Store IG post ID for future analytics/linking
- Implement exponential backoff for retries
- Log all publishing events for audit trail
