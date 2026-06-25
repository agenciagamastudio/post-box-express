# EPIC-06: Tests & Coverage

**Status:** DRAFT  
**Priority:** MEDIUM  
**Effort:** 6h  
**Owner:** @qa (Quinn)

---

## Objective

Achieve 50%+ test coverage with unit and integration tests. All critical paths validated and regressions prevented.

---

## Acceptance Criteria

- [ ] Unit tests for all utilities and hooks
- [ ] Integration tests for auth flow
- [ ] Integration tests for post creation → approval → publishing
- [ ] API endpoint tests (mocked backend)
- [ ] Test coverage >= 50%
- [ ] All tests passing: `npm test`
- [ ] No flaky tests (run 3x without failure)

---

## Stories

### Story 06.1: Unit Tests (2h)

**Description:**
Write unit tests for utilities, helpers, validators.

**AC:**
- [ ] Tests for formatTime, validators, parsers
- [ ] Tests for Instagram service functions
- [ ] Tests for hooks (useInstagramData, etc.)
- [ ] All tests passing

---

### Story 06.2: Integration Tests (2h)

**Description:**
Write integration tests for key flows.

**AC:**
- [ ] Auth login/logout flow tests
- [ ] Post creation → approval → publishing flow
- [ ] Error handling scenarios
- [ ] Session persistence

---

### Story 06.3: Coverage & CI/CD (2h)

**Description:**
Integrate tests into CI/CD and ensure coverage target.

**AC:**
- [ ] Coverage report generated
- [ ] Coverage >= 50%
- [ ] CI/CD runs tests on push
- [ ] Failing tests block merge

---

## Dependencies

- ⬅️ EPIC-01 through EPIC-05 (need code to test)
- Can run in parallel once code exists

---

## Definition of Done

- ✅ Coverage >= 50%
- ✅ All tests passing
- ✅ No flaky tests
- ✅ Coverage reports in CI/CD

---

## Notes

- Focus on critical paths first (auth, publishing)
- Use mocked backend APIs for tests
- Document test scenarios in code
