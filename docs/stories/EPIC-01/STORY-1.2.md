# STORY-1.2 — Fix TypeScript any types: Calendar (WeekView, ProgressiveView)

**Epic:** EPIC-01 TypeScript Compliance  
**Estimativa:** 1 point (1 hora)  
**Priority:** P0 (BLOCKER)  
**Status:** Draft

---

## Descrição

Remove TypeScript `any` types from Calendar-related components: WeekView.tsx and ProgressiveView.tsx. These are critical for the calendar feature and blocking the build.

---

## Acceptance Criteria

```gherkin
Given I run `npm run lint` 
When I check WeekView.tsx and ProgressiveView.tsx
Then I see 0 TS errors in these files
And all event types are properly typed (no `any`)
And calendar event data structures have explicit types
```

---

## Scope

### IN
- WeekView.tsx (event handler types, data structures)
- ProgressiveView.tsx (view state types, event types)
- Type definitions for calendar events
- Props interfaces for both components

### OUT
- Changing calendar layout or functionality
- Adding new calendar features
- Refactoring calendar logic (separate story)

---

## Dependências
- None (can be done in parallel with STORY-1.1)

---

## Critério de Done
- [ ] WeekView.tsx: 0 `any` types
- [ ] ProgressiveView.tsx: 0 `any` types
- [ ] Event interfaces properly defined
- [ ] `npm run lint` passes
- [ ] Calendar still renders correctly (no runtime errors)
- [ ] Tested in browser
- [ ] File List updated

---

## File List
| File | Change | Status |
|------|--------|--------|
| `src/components/Calendar/WeekView.tsx` | Type fixes | [ ] |
| `src/components/Calendar/ProgressiveView.tsx` | Type fixes | [ ] |
| `src/types/calendar.ts` | Add/update calendar types | [ ] |

---

**Criada por:** @sm (River)  
**Data:** 2026-06-25  
**Versão:** 1.0
