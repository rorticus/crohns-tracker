---

description: "Task list template for feature implementation"
---

# Tasks: Crohns Symptom Tracker

**Input**: Design documents from `/specs/001-crohns-tracker/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included following TDD approach as per constitutional requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile app**: `src/`, `app/`, `__tests__/` at repository root
- Paths shown below assume Expo Router structure with src organization

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Expo project structure with TypeScript template
- [x] T002 Install core dependencies (expo-router, expo-sqlite, drizzle-orm, zustand, react-hook-form, react-native-calendars)
- [x] T003 [P] Configure TypeScript paths and build settings in tsconfig.json
- [x] T004 [P] Setup ESLint configuration with React Native and accessibility rules in .eslintrc.js
- [x] T005 [P] Configure Drizzle ORM settings in drizzle.config.ts
- [x] T006 Create project folder structure (src/, app/, __tests__/ directories)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create database schema with Drizzle ORM in src/db/schema.ts
- [x] T008 [P] Setup SQLite database client and connection in src/db/client.ts
- [x] T009 [P] Create initial database migration scripts in src/db/migrations/
- [x] T010 Define TypeScript interfaces for entries in src/types/entry.ts
- [x] T011 [P] Create validation service with Bristol scale and urgency validation in src/services/validationService.ts
- [x] T012 [P] Setup Expo Router configuration and root layout in app/_layout.tsx
- [x] T013 Create base UI components (buttons, inputs, icons) in src/components/UI/
- [x] T014 [P] Configure accessibility helpers and constants in src/utils/constants.ts
- [x] T015 Setup date utilities for timestamp handling in src/utils/dateUtils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Symptom Logging (Priority: P1) 🎯 MVP

**Goal**: Users can quickly log bowel movements with consistency and urgency ratings within 2 taps

**Independent Test**: Open app, tap today's date, log bowel movement with consistency 4 and urgency 2, verify entry saved and visible

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [P] [US1] Unit test for entry service CRUD operations in __tests__/services/entryService.test.ts
- [x] T017 [P] [US1] Unit test for bowel movement validation in __tests__/services/validationService.test.ts
- [x] T018 [P] [US1] Integration test for calendar entry creation flow in __tests__/screens/CalendarScreen.test.tsx

### Implementation for User Story 1

- [x] T019 [P] [US1] Create Entry and BowelMovement type definitions in src/types/entry.ts
- [x] T020 [P] [US1] Implement EntryService with create/read operations in src/services/entryService.ts
- [x] T021 [US1] Create entry store with Zustand for state management in src/stores/entryStore.ts
- [x] T022 [US1] Implement calendar component with date selection in src/components/Calendar/CalendarComponent.tsx
- [x] T023 [US1] Create bowel movement entry form with Bristol scale picker in src/components/Forms/BowelMovementForm.tsx
- [x] T024 [US1] Implement calendar screen with quick entry access in app/(tabs)/calendar.tsx
- [x] T025 [US1] Create entry form screen for bowel movement logging in app/entry/new.tsx
- [x] T026 [US1] Setup Expo Router navigation for calendar and entry forms in app/(tabs)/calendar.tsx and app/entry/new.tsx
- [x] T027 [US1] Add form validation and error handling with React Hook Form
- [x] T028 [US1] Implement 2-tap entry creation with accessibility support

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Daily Timeline Review (Priority: P2)

**Goal**: Users can view chronological timeline of all entries for any selected day

**Independent Test**: Log multiple entries for a day, navigate to timeline view, verify chronological order and entry details displayed

### Tests for User Story 2 ⚠️

- [x] T029 [P] [US2] Unit test for timeline data sorting and filtering in __tests__/services/entryService.test.ts
- [x] T030 [P] [US2] Integration test for timeline component with multiple entries in __tests__/components/Timeline.test.tsx

### Implementation for User Story 2

- [x] T031 [P] [US2] Create timeline component with FlatList optimization in src/components/Timeline/TimelineComponent.tsx
- [x] T032 [P] [US2] Implement timeline entry item component with icons in src/components/Timeline/TimelineItem.tsx
- [x] T033 [US2] Create timeline screen with date selection in src/screens/TimelineScreen/index.tsx
- [x] T034 [US2] Add timeline state management to entry store in src/stores/entryStore.ts
- [x] T035 [US2] Implement entry details display with edit/delete actions
- [x] T036 [US2] Setup timeline navigation route in app/(tabs)/timeline.tsx
- [x] T037 [US2] Add empty state component for days with no entries in src/components/Timeline/EmptyState.tsx
- [x] T038 [US2] Optimize timeline performance for 50+ entries with proper FlatList props

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - General Notes Tracking (Priority: P3)

**Goal**: Users can record contextual notes with categories (food/exercise/medication/other)

**Independent Test**: Create note entry with "food" category and descriptive text, verify categorization and timeline display

### Tests for User Story 3 ⚠️

- [x] T039 [P] [US3] Unit test for note validation and category handling in __tests__/services/validationService.test.ts
- [x] T040 [P] [US3] Integration test for note form submission in __tests__/components/Forms/NoteForm.test.tsx

### Implementation for User Story 3

- [x] T041 [P] [US3] Create Note type definition and interfaces in src/types/entry.ts
- [x] T042 [P] [US3] Implement note creation in EntryService in src/services/entryService.ts
- [x] T043 [US3] Create note entry form with category selection in src/components/Forms/NoteForm.tsx
- [x] T044 [US3] Add note support to entry store and state management in src/stores/entryStore.ts
- [x] T045 [US3] Implement note display in timeline with category icons in src/components/Timeline/TimelineItem.tsx
- [x] T046 [US3] Add note creation route and form navigation in app/entry/new.tsx
- [x] T047 [US3] Create category picker component with accessibility in src/components/Forms/CategoryPicker.tsx
- [x] T048 [US3] Integrate note entries with calendar and timeline views

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Data Export for Analysis (Priority: P4)

**Goal**: Users can export data in CSV/TXT formats for specified date ranges

**Independent Test**: Select 30-day date range, export as CSV, verify structured data format and system sharing dialog

### Tests for User Story 4 ⚠️

- [x] T049 [P] [US4] Unit test for CSV export generation in __tests__/services/exportService.test.ts
- [x] T050 [P] [US4] Unit test for TXT export formatting in __tests__/services/exportService.test.ts
- [x] T051 [P] [US4] Integration test for export workflow in __tests__/screens/ExportScreen.test.tsx

### Implementation for User Story 4

- [x] T052 [P] [US4] Create export service with CSV/TXT generation in src/services/exportService.ts
- [x] T053 [P] [US4] Implement export store for state management in src/stores/exportStore.ts
- [x] T054 [US4] Create export screen with date range selection in src/screens/ExportScreen/index.tsx
- [x] T055 [US4] Implement date range picker component in src/components/Forms/DateRangePicker.tsx
- [x] T056 [US4] Add file sharing integration with system dialog in src/services/exportService.ts
- [x] T057 [US4] Create export progress tracking and UI feedback
- [x] T058 [US4] Setup export navigation route in app/(tabs)/export.tsx
- [x] T059 [US4] Add data import functionality for backup restore in src/services/exportService.ts
- [x] T060 [US4] Implement export format selection and preview

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T061 [P] Add comprehensive error handling and user feedback across all screens
- [x] T062 [P] Implement accessibility enhancements (VoiceOver/TalkBack support)
- [x] T063 [P] Performance optimization for timeline with large datasets
- [x] T064 [P] Add loading states and skeleton components in src/components/UI/
- [x] T065 [P] Create app icon and splash screen assets
- [x] T066 [P] Setup app metadata and store listing configuration
- [x] T067 [P] Add haptic feedback for user interactions
- [x] T068 [P] Implement data persistence validation and recovery
- [x] T069 Run quickstart.md validation and end-to-end testing
- [x] T070 Final code review and constitutional compliance check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Uses data from all stories but independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Type definitions before services
- Services before UI components
- Components before screens
- Screens before navigation integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Type definitions and services within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for entry service CRUD operations in __tests__/services/entryService.test.ts"
Task: "Unit test for bowel movement validation in __tests__/services/validationService.test.ts"
Task: "Integration test for calendar entry creation flow in __tests__/screens/CalendarScreen.test.tsx"

# Launch all type definitions and services for User Story 1 together:
Task: "Create Entry and BowelMovement type definitions in src/types/entry.ts"
Task: "Implement EntryService with create/read operations in src/services/entryService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence