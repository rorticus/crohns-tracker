# Tasks: Day Tags

**Input**: Design documents from `/specs/002-day-tags/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD approach mandated by constitution - test tasks included per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- React Native mobile app structure
- `src/` for source code at repository root
- `app/` for Expo Router screens
- `__tests__/` for test files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions

- [x] T001 Create type definitions file in src/types/dayTag.ts
- [x] T002 [P] Create utility functions file in src/utils/tagUtils.ts
- [x] T003 [P] Create DayTags components directory at src/components/DayTags/

**Checkpoint**: ✅ Foundation files created - ready for database and service setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migration

- [x] T004 Update database schema with dayTags table in src/db/schema.ts
- [x] T005 Update database schema with dayTagAssociations table in src/db/schema.ts
- [x] T006 Export new table schemas from database client in src/db/client.ts
- [x] T007 Generate Drizzle migration with: npx drizzle-kit generate:sqlite
- [x] T008 Verify migration creates proper indexes (date, tagId, unique constraint)
- [x] T009 Test migration by restarting app and checking database structure

### Service Layer Tests (TDD - Write First, Ensure FAIL)

- [x] T010 [P] Create DayTagService test file in __tests__/services/dayTagService.test.ts
- [x] T011 [P] Write test: createTag() creates tag with normalized name
- [x] T012 [P] Write test: createTag() reuses existing tag if name matches
- [x] T013 [P] Write test: createTag() validates tag length (1-50 chars)
- [x] T014 [P] Write test: createTag() validates allowed characters
- [x] T015 [P] Write test: getAllTags() returns tags sorted by usage
- [x] T016 [P] Write test: getTagsForDate() returns tags for specific date
- [x] T017 [P] Write test: addTagToDay() creates association
- [x] T018 [P] Write test: addTagToDay() enforces max 10 tags per day
- [x] T019 [P] Write test: addTagToDay() increments usageCount
- [x] T020 [P] Write test: removeTagFromDay() deletes association
- [x] T021 [P] Write test: removeTagFromDay() decrements usageCount

**Run tests - all should FAIL**: npm test -- dayTagService.test.ts

### Service Layer Implementation (TDD - Make tests PASS)

- [x] T022 Implement DayTagService in src/services/dayTagService.ts
- [x] T023 Implement normalizeTagName() utility method
- [x] T024 Implement validateTagName() with TAG_VALIDATION rules
- [x] T025 Implement createTag() with validation and duplicate check
- [x] T026 [P] Implement getAllTags() with ordering by usageCount
- [x] T027 [P] Implement getTagById() method
- [x] T028 Implement getTagsForDate() with JOIN query
- [x] T029 Implement addTagToDay() with validation and usageCount update
- [x] T030 Implement removeTagFromDay() with usageCount decrement
- [x] T031 Implement getDatesWithTag() for date range filtering
- [x] T032 Implement getTaggedDatesInMonth() for calendar rendering

**Run tests - all should PASS**: npm test -- dayTagService.test.ts

### Tag Utilities

- [x] T033 [P] Implement tag normalization helper in src/utils/tagUtils.ts
- [x] T034 [P] Implement tag parsing helper functions in src/utils/tagUtils.ts
- [x] T035 [P] Create utility tests in __tests__/utils/tagUtils.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Day Tagging (Priority: P1) 🎯 MVP

**Goal**: Enable users to add, view, edit, and remove tags from calendar days. Tags visible on calendar.

**Independent Test**: Navigate to calendar, select today, add tag "Vacation", verify it appears on calendar day, remove tag, verify it's gone.

### Store Tests (TDD - Write First)

- [ ] T036 [P] [US1] Create DayTagStore test file in __tests__/stores/dayTagStore.test.ts
- [ ] T037 [P] [US1] Write test: loadAllTags() fetches and stores tags
- [ ] T038 [P] [US1] Write test: loadTagsForDate() fetches tags for specific date
- [ ] T039 [P] [US1] Write test: createTag() creates tag and updates allTags state
- [ ] T040 [P] [US1] Write test: addTagToDay() adds tag and updates tagsForDate state
- [ ] T041 [P] [US1] Write test: removeTagFromDay() removes tag and updates state
- [ ] T042 [P] [US1] Write test: loadTaggedDatesInMonth() fetches and caches month data

**Run tests - all should FAIL**: npm test -- dayTagStore.test.ts

### Store Implementation (TDD - Make tests PASS)

- [x] T043 [US1] Create DayTagStore in src/stores/dayTagStore.ts with initial state
- [x] T044 [US1] Implement loadAllTags() action in DayTagStore
- [x] T045 [US1] Implement loadTagsForDate() action in DayTagStore
- [x] T046 [US1] Implement createTag() action in DayTagStore
- [x] T047 [US1] Implement addTagToDay() action with tag creation fallback
- [x] T048 [US1] Implement removeTagFromDay() action in DayTagStore
- [x] T049 [US1] Implement loadTaggedDatesInMonth() action in DayTagStore
- [x] T050 [US1] Implement error handling and loading states in DayTagStore
- [x] T051 [US1] Implement clearError(), reset(), and cache management actions

**Run tests - all should PASS**: npm test -- dayTagStore.test.ts

### UI Component Tests (TDD - Write First)

- [ ] T052 [P] [US1] Create DayTagBadge test in __tests__/components/DayTags/DayTagBadge.test.tsx
- [ ] T053 [P] [US1] Write test: DayTagBadge renders tag name
- [ ] T054 [P] [US1] Write test: DayTagBadge uses orange theme for inherited tags
- [ ] T055 [P] [US1] Write test: DayTagBadge uses blue theme for entry tags
- [ ] T056 [P] [US1] Write test: DayTagBadge calls onPress when pressable
- [ ] T057 [P] [US1] Create DayTagPicker test in __tests__/components/DayTags/DayTagPicker.test.tsx
- [ ] T058 [P] [US1] Write test: DayTagPicker renders input field
- [ ] T059 [P] [US1] Write test: DayTagPicker shows autocomplete suggestions
- [ ] T060 [P] [US1] Write test: DayTagPicker adds tag on suggestion tap
- [ ] T061 [P] [US1] Write test: DayTagPicker validates max tags limit
- [ ] T062 [P] [US1] Create DayTagManager test in __tests__/components/DayTags/DayTagManager.test.tsx
- [ ] T063 [P] [US1] Write test: DayTagManager renders modal with date header
- [ ] T064 [P] [US1] Write test: DayTagManager shows current tags
- [ ] T065 [P] [US1] Write test: DayTagManager allows adding tags via picker
- [ ] T066 [P] [US1] Write test: DayTagManager allows removing tags

**Run tests - all should FAIL**: npm test -- DayTags/

### UI Component Implementation (TDD - Make tests PASS)

- [x] T067 [P] [US1] Implement DayTagBadge component in src/components/DayTags/DayTagBadge.tsx
- [x] T068 [P] [US1] Implement DayTagPicker component in src/components/DayTags/DayTagPicker.tsx
- [x] T069 [US1] Implement DayTagManager modal in src/components/DayTags/DayTagManager.tsx
- [x] T070 [US1] Add tag input with autocomplete to DayTagManager
- [x] T071 [US1] Add tag list with remove functionality to DayTagManager
- [x] T072 [US1] Add save/cancel buttons to DayTagManager
- [x] T073 [US1] Integrate DayTagManager with DayTagStore

**Run tests - all should PASS**: npm test -- DayTags/

### Calendar Integration

- [x] T074 [P] [US1] Create DayTagIndicator component in src/components/Calendar/DayTagIndicator.tsx
- [x] T075 [US1] Modify CalendarComponent to load tagged dates for current month in src/components/Calendar/CalendarComponent.tsx
- [x] T076 [US1] Add orange dot indicators to calendar for tagged days in src/components/Calendar/CalendarComponent.tsx
- [x] T077 [US1] Add accessibility labels for tagged days in src/components/Calendar/CalendarComponent.tsx
- [x] T078 [US1] Update calendar screen to trigger DayTagManager on date selection in app/(tabs)/calendar.tsx
- [x] T079 [US1] Add modal state management to calendar screen in app/(tabs)/calendar.tsx

**Checkpoint**: User Story 1 complete - can add/remove/view day tags on calendar

---

## Phase 4: User Story 2 - Automatic Tag Inheritance (Priority: P2)

**Goal**: Entries automatically inherit day tags. Retroactive application works. Tags visually distinguished.

**Independent Test**: Tag today with "Test", create entry, verify entry shows inherited "Test" tag with orange badge (not blue).

### Service Extension Tests (TDD)

- [ ] T080 [P] [US2] Write test: getEntriesForDate() includes dayTags property
- [ ] T081 [P] [US2] Write test: dayTags array contains all tags for entry's date
- [ ] T082 [P] [US2] Write test: adding tag to past day retroactively applies to entries
- [ ] T083 [P] [US2] Write test: removing tag from day removes from all entries

**Run tests - all should FAIL**: npm test -- dayTagService.test.ts

### Service Extension Implementation

- [ ] T084 [US2] Extend EntryService.getEntriesForDate() to include dayTags in src/services/entryService.ts
- [ ] T085 [US2] Create helper function to attach day tags to entries in src/services/entryService.ts
- [ ] T086 [US2] Ensure all entry fetch methods compute dayTags dynamically

**Run tests - all should PASS**: npm test -- dayTagService.test.ts

### UI Integration

- [ ] T087 [P] [US2] Modify TimelineItem to display inherited day tags in src/components/Timeline/TimelineItem.tsx
- [ ] T088 [P] [US2] Use DayTagBadge with isInherited=true for day tags in TimelineItem
- [ ] T089 [P] [US2] Add visual separation between day tags and entry tags in TimelineItem
- [ ] T090 [US2] Modify entry detail screen to show inherited day tags in app/entry/[id].tsx
- [ ] T091 [US2] Add accessibility labels distinguishing day vs entry tags

**Checkpoint**: User Story 2 complete - entries automatically show day tags with visual distinction

---

## Phase 5: User Story 3 - Filter and View by Day Tags (Priority: P3)

**Goal**: Filter timeline and calendar by day tags. Multi-tag support with AND/OR logic.

**Independent Test**: Create entries on multiple days with different tags, filter by "Vacation", verify only vacation day entries shown.

### Service Filtering Tests (TDD)

- [ ] T092 [P] [US3] Write test: getEntriesByTag() filters entries by single tag
- [ ] T093 [P] [US3] Write test: getEntriesByTags() with matchMode 'any' (OR logic)
- [ ] T094 [P] [US3] Write test: getEntriesByTags() with matchMode 'all' (AND logic)
- [ ] T095 [P] [US3] Write test: filtering returns entries in chronological order
- [ ] T096 [P] [US3] Write test: filtering respects date range constraints

**Run tests - all should FAIL**: npm test -- dayTagService.test.ts

### Service Filtering Implementation

- [ ] T097 [US3] Implement getEntriesByTag() method in src/services/dayTagService.ts
- [ ] T098 [US3] Implement getEntriesByTags() with AND logic in src/services/dayTagService.ts
- [ ] T099 [US3] Implement getEntriesByTags() with OR logic in src/services/dayTagService.ts
- [ ] T100 [US3] Optimize queries with proper indexes and joins

**Run tests - all should PASS**: npm test -- dayTagService.test.ts

### Store Filtering Extension

- [ ] T101 [US3] Add applyFilter() action to DayTagStore in src/stores/dayTagStore.ts
- [ ] T102 [US3] Add clearFilter() action to DayTagStore in src/stores/dayTagStore.ts
- [ ] T103 [US3] Add filteredEntries state management to DayTagStore
- [ ] T104 [US3] Add isFilterActive() selector to DayTagStore

### Filter UI Tests (TDD)

- [ ] T105 [P] [US3] Create DayTagFilter test in __tests__/components/DayTags/DayTagFilter.test.tsx
- [ ] T106 [P] [US3] Write test: DayTagFilter shows selected tags
- [ ] T107 [P] [US3] Write test: DayTagFilter allows adding tags to filter
- [ ] T108 [P] [US3] Write test: DayTagFilter shows AND/OR toggle
- [ ] T109 [P] [US3] Write test: DayTagFilter has clear filter button

**Run tests - all should FAIL**: npm test -- DayTagFilter.test.tsx

### Filter UI Implementation

- [ ] T110 [P] [US3] Implement DayTagFilter component in src/components/DayTags/DayTagFilter.tsx
- [ ] T111 [US3] Add tag selection with autocomplete to DayTagFilter
- [ ] T112 [US3] Add AND/OR match mode toggle to DayTagFilter
- [ ] T113 [US3] Add clear filter button to DayTagFilter
- [ ] T114 [US3] Add active filter indicator to DayTagFilter

**Run tests - all should PASS**: npm test -- DayTagFilter.test.tsx

### Timeline Screen Integration

- [ ] T115 [US3] Add DayTagFilter component to timeline screen in app/(tabs)/timeline.tsx
- [ ] T116 [US3] Connect filter to DayTagStore in timeline screen
- [ ] T117 [US3] Display filteredEntries when filter active in timeline screen
- [ ] T118 [US3] Add filter active indicator to timeline header
- [ ] T119 [US3] Ensure filter persists during timeline session

### Calendar Filter Integration

- [ ] T120 [P] [US3] Highlight only filtered days on calendar when filter active
- [ ] T121 [P] [US3] Add filter indicator to calendar header
- [ ] T122 [P] [US3] Update DateRangePicker to work with filter in src/components/Forms/DateRangePicker.tsx

**Checkpoint**: User Story 3 complete - can filter entries by single or multiple day tags

---

## Phase 6: User Story 4 - Export Filtered Data (Priority: P4)

**Goal**: Export entries filtered by day tags with tag information included in export.

**Independent Test**: Filter by "Medication", export data, verify CSV contains only medication-tagged entries and includes day tags column.

### Export Service Tests (TDD)

- [ ] T123 [P] [US4] Write test: export includes dayTags column in CSV format
- [ ] T124 [P] [US4] Write test: export includes day tags in TXT format
- [ ] T125 [P] [US4] Write test: export respects active tag filter
- [ ] T126 [P] [US4] Write test: export metadata includes filter criteria

**Run tests - all should FAIL**: npm test -- exportService.test.ts

### Export Service Implementation

- [ ] T127 [US4] Extend ExportService to accept tag filter parameter in src/services/exportService.ts
- [ ] T128 [US4] Add dayTags column to CSV export format in src/services/exportService.ts
- [ ] T129 [US4] Add day tags section to TXT export format in src/services/exportService.ts
- [ ] T130 [US4] Include filter metadata in export header in src/services/exportService.ts
- [ ] T131 [US4] Integrate with DayTagService for filtered queries in src/services/exportService.ts

**Run tests - all should PASS**: npm test -- exportService.test.ts

### Export UI Integration

- [ ] T132 [US4] Update export screen to show active filter status in app/(tabs)/export.tsx
- [ ] T133 [US4] Add option to export with current filter in app/(tabs)/export.tsx
- [ ] T134 [US4] Add option to export all data (ignore filter) in app/(tabs)/export.tsx
- [ ] T135 [US4] Update export preview to show filtered entry count
- [ ] T136 [US4] Test export flow with filtered and unfiltered data

**Checkpoint**: User Story 4 complete - can export filtered data with day tags

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance Optimization

- [ ] T137 [P] Add query performance logging for tag operations
- [ ] T138 [P] Verify tag operations complete in <2 seconds (SC-001)
- [ ] T139 [P] Verify filtering 1000 entries completes in <3 seconds (SC-002)
- [ ] T140 [P] Verify calendar render with tags completes in <100ms
- [ ] T141 Profile app with React Native DevTools for memory leaks
- [ ] T142 Optimize calendar re-renders when month changes

### Validation & Error Handling

- [ ] T143 [P] Extend ValidationService with tag validation in src/services/validationService.ts
- [ ] T144 [P] Add user-friendly error messages for tag validation failures
- [ ] T145 [P] Add error boundaries for tag-related components
- [ ] T146 Add offline error handling for tag operations

### Accessibility

- [ ] T147 [P] Test screen reader support for day tags
- [ ] T148 [P] Verify all interactive elements have accessibility labels
- [ ] T149 [P] Test keyboard navigation for tag input
- [ ] T150 [P] Verify color contrast meets WCAG 2.1 AA (orange/blue themes)

### Edge Cases

- [ ] T151 [P] Handle very long tag names (truncation, overflow)
- [ ] T152 [P] Handle special characters in tag names (validation)
- [ ] T153 [P] Handle day with 100+ entries (performance test)
- [ ] T154 [P] Handle midnight spanning entries (tag inheritance logic)
- [ ] T155 Test database migration on existing user data

### Documentation

- [ ] T156 [P] Add JSDoc comments to all DayTagService methods
- [ ] T157 [P] Add JSDoc comments to DayTagStore actions
- [ ] T158 [P] Update CLAUDE.md with day tags feature context
- [ ] T159 [P] Create user-facing help text for day tags feature

### Code Quality

- [ ] T160 Run npm run lint and fix all warnings
- [ ] T161 Run npm test and ensure 90%+ coverage for services
- [ ] T162 Run npm test and ensure 80%+ overall coverage
- [ ] T163 Review and refactor duplicated code
- [ ] T164 Remove debug logging and console.log statements

### Final Validation

- [ ] T165 Verify all acceptance scenarios from spec.md pass
- [ ] T166 Test complete workflow from quickstart.md
- [ ] T167 Verify all functional requirements (FR-001 through FR-013) met
- [ ] T168 Verify all success criteria (SC-001 through SC-006) met
- [ ] T169 Perform manual testing on iOS simulator
- [ ] T170 Perform manual testing on Android emulator

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Independent but extends US1 components
  - US3 (Phase 5): Can start after Foundational - Independent but uses US1+US2 components
  - US4 (Phase 6): Depends on US3 completion (needs filtering)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Foundational (Phase 2) - MUST complete first
    ↓
    ├─→ US1 (Phase 3) - Basic Day Tagging [Independent, MVP]
    │       ↓
    ├─→ US2 (Phase 4) - Automatic Inheritance [Independent, extends US1 UI]
    │       ↓
    ├─→ US3 (Phase 5) - Filtering [Independent, extends US1+US2]
    │       ↓
    └─→ US4 (Phase 6) - Export [Depends on US3 filtering]
            ↓
        Polish (Phase 7)
```

### Within Each User Story

1. **Tests written FIRST** (TDD - must FAIL before implementation)
2. **Implementation makes tests PASS**
3. **Integration** connects to UI/screens
4. **Checkpoint validation** before moving to next story

### Parallel Opportunities

**Phase 1 (Setup)**: T001, T002, T003 can all run in parallel

**Phase 2 (Foundational)**:
- Database: T004-T009 must run sequentially (migration dependencies)
- Tests: T010-T021 can all run in parallel (write all tests together)
- Implementation: T022-T032 sequential (service methods build on each other)
- Utilities: T033-T035 can run in parallel with service implementation

**Phase 3 (US1)**:
- Store tests: T036-T042 can all run in parallel
- Store implementation: T043-T051 mostly sequential
- Component tests: T052-T066 can run in parallel
- Component implementation: T067-T068 parallel, T069-T073 sequential
- Calendar: T074 parallel with T075-T077 which are sequential

**Phase 4 (US2)**:
- Tests: T080-T083 can run in parallel
- Service: T084-T086 sequential
- UI: T087-T089 parallel, T090-T091 parallel

**Phase 5 (US3)**:
- Service tests: T092-T096 can run in parallel
- Service implementation: T097-T100 sequential
- Store: T101-T104 sequential
- Filter tests: T105-T109 can run in parallel
- Filter UI: T110 parallel with T111-T114 which are sequential
- Timeline: T115-T119 sequential
- Calendar: T120-T122 can run in parallel

**Phase 6 (US4)**:
- Tests: T123-T126 can run in parallel
- Service: T127-T131 sequential
- UI: T132-T136 sequential

**Phase 7 (Polish)**: Most tasks marked [P] can run in parallel (T137-T150, T151-T155, T156-T159)

---

## Parallel Example: User Story 1 - Component Tests

```bash
# Launch all component tests for User Story 1 together (TDD - write first):
Task T052: "Create DayTagBadge test in __tests__/components/DayTags/DayTagBadge.test.tsx"
Task T053: "Write test: DayTagBadge renders tag name"
Task T054: "Write test: DayTagBadge uses orange theme for inherited tags"
Task T055: "Write test: DayTagBadge uses blue theme for entry tags"
Task T056: "Write test: DayTagBadge calls onPress when pressable"
Task T057: "Create DayTagPicker test in __tests__/components/DayTags/DayTagPicker.test.tsx"
Task T058: "Write test: DayTagPicker renders input field"
Task T059: "Write test: DayTagPicker shows autocomplete suggestions"
Task T060: "Write test: DayTagPicker adds tag on suggestion tap"
Task T061: "Write test: DayTagPicker validates max tags limit"
Task T062: "Create DayTagManager test in __tests__/components/DayTags/DayTagManager.test.tsx"
Task T063: "Write test: DayTagManager renders modal with date header"
Task T064: "Write test: DayTagManager shows current tags"
Task T065: "Write test: DayTagManager allows adding tags via picker"
Task T066: "Write test: DayTagManager allows removing tags"

# Run all tests (they should FAIL):
npm test -- DayTags/

# Then implement components T067-T073 to make tests PASS
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T035) - CRITICAL
3. Complete Phase 3: User Story 1 (T036-T079)
4. **STOP and VALIDATE**: Test US1 independently per acceptance criteria
5. Deploy/demo if ready - users can now tag days on calendar!

**Estimated Time**: ~6-8 hours for MVP (following TDD workflow)

### Incremental Delivery

1. **Foundation** (T001-T035) → Database, types, services ready
2. **+US1** (T036-T079) → Tag days on calendar ✅ MVP COMPLETE
3. **+US2** (T080-T091) → Entries show inherited tags
4. **+US3** (T092-T122) → Filter entries by tags
5. **+US4** (T123-T136) → Export filtered data
6. **+Polish** (T137-T170) → Performance, accessibility, validation

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T035)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T036-T079)
   - **Developer B**: Utility work + tests (T033-T035, help with T010-T021)
   - **Developer C**: Documentation prep (T156-T159)
3. After US1 complete:
   - **Developer A**: User Story 2 (T080-T091)
   - **Developer B**: User Story 3 (T092-T122)
   - **Developer C**: User Story 4 (T123-T136)
4. All converge for Polish phase (T137-T170)

---

## TDD Workflow (CRITICAL)

**Red-Green-Refactor Cycle**:

1. **RED**: Write test first, run it, ensure it FAILS
2. **GREEN**: Write minimal code to make test PASS
3. **REFACTOR**: Clean up code while keeping tests passing
4. **COMMIT**: Commit after each test passes

**Example for T010-T021 (Service Tests)**:

```bash
# 1. Write all tests first (T010-T021)
# 2. Run tests - all should FAIL
npm test -- dayTagService.test.ts

# 3. Implement service methods (T022-T032)
# 4. Run tests again - all should PASS
npm test -- dayTagService.test.ts

# 5. Check coverage
npm test -- --coverage dayTagService.test.ts
# Target: 90%+ for service layer
```

---

## Validation Checkpoints

### After Phase 2 (Foundational):
- [ ] Database tables created with proper indexes
- [ ] All DayTagService tests passing (90%+ coverage)
- [ ] Tag utilities working
- [ ] No TypeScript errors
- [ ] npm run lint passing

### After Phase 3 (US1 - MVP):
- [ ] Can add tag to today on calendar
- [ ] Can see tag indicator on calendar
- [ ] Can remove tag from day
- [ ] Can add multiple tags (up to 10)
- [ ] Tag autocomplete works
- [ ] All US1 tests passing
- [ ] Performance: tag ops <2s (SC-001)

### After Phase 4 (US2):
- [ ] New entries inherit day tags
- [ ] Existing entries show retroactively applied tags
- [ ] Day tags visually distinct (orange) from entry tags (blue)
- [ ] Removing day tag removes from all entries
- [ ] All US2 tests passing

### After Phase 5 (US3):
- [ ] Can filter timeline by single tag
- [ ] Can filter by multiple tags (AND logic)
- [ ] Can filter by multiple tags (OR logic)
- [ ] Filter persists during session
- [ ] Calendar highlights only filtered days
- [ ] Performance: filtering 1000 entries <3s (SC-002)
- [ ] All US3 tests passing

### After Phase 6 (US4):
- [ ] Can export filtered data
- [ ] CSV includes dayTags column
- [ ] TXT format shows day tags
- [ ] Export metadata shows filter criteria
- [ ] All US4 tests passing

### After Phase 7 (Polish):
- [ ] All functional requirements met (FR-001 to FR-013)
- [ ] All success criteria met (SC-001 to SC-006)
- [ ] 90%+ test coverage for services
- [ ] 80%+ overall test coverage
- [ ] No accessibility violations
- [ ] No memory leaks
- [ ] All edge cases handled
- [ ] Documentation complete

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability (US1, US2, US3, US4)
- **TDD mandatory**: Constitution requires tests first, 90% service coverage, 80% overall
- Each user story should be independently completable and testable
- **Verify tests FAIL before implementing** (RED phase of TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Performance targets**: Tag ops <2s, filtering <3s, calendar render <100ms
- **Accessibility**: WCAG 2.1 AA compliance required
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Total tasks**: 170
- **Setup (Phase 1)**: 3 tasks
- **Foundational (Phase 2)**: 32 tasks (includes TDD tests)
- **User Story 1 (Phase 3)**: 44 tasks (includes TDD tests)
- **User Story 2 (Phase 4)**: 12 tasks (includes TDD tests)
- **User Story 3 (Phase 5)**: 31 tasks (includes TDD tests)
- **User Story 4 (Phase 6)**: 14 tasks (includes TDD tests)
- **Polish (Phase 7)**: 34 tasks

**Parallel opportunities**: ~60 tasks marked [P] can run concurrently

**Estimated effort**:
- MVP (Setup + Foundational + US1): ~6-8 hours (TDD workflow)
- Full feature (all phases): ~12-16 hours (TDD workflow)

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (T001-T079) delivers independently testable day tagging feature
