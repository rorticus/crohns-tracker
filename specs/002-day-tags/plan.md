# Implementation Plan: Day Tags

**Branch**: `002-day-tags` | **Date**: 2025-10-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-day-tags/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable users to tag calendar days with contextual labels (e.g., "vacation", "new medicine") that automatically apply to all entries created on those days. Users can filter and export entries by day tags to analyze symptom patterns in specific contexts. This feature extends the existing entry tracking system with a new day-level tagging layer, leveraging the current Drizzle ORM + SQLite architecture, Zustand state management, and React Native Calendars UI.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with React Native 0.81.5 + Expo SDK 54.0.20
**Primary Dependencies**: Drizzle ORM 0.44.7, expo-sqlite 16.0.8, Zustand 5.0.8, React Hook Form 7.65.0, react-native-calendars 1.1313.0, expo-router 6.0.13
**Storage**: SQLite (crohns_tracker.db) via expo-sqlite with Drizzle ORM for type-safe queries
**Testing**: Jest (Expo config) + React Native Testing Library, ESLint 9.25.0 with Expo config
**Target Platform**: iOS + Android (React Native mobile app, offline-first)
**Project Type**: Mobile (React Native + Expo, follows Expo Router file-based routing)
**Performance Goals**: Tag operations <2s, filtering 1000+ entries <3s, calendar render <100ms, 60fps UI
**Constraints**: Offline-capable (local SQLite), <200MB total app memory, accessible (WCAG 2.1 AA), no future entries
**Scale/Scope**: Single-user app, ~20 active tags, ~1000 entries, 3 new screens/modals, extend 5 existing components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality & Standards
✅ **PASS** - Feature follows existing patterns (Drizzle schema, service layer, Zustand store, React Native components). Static analysis via ESLint will be enforced. Code reviews required before merge.

### II. Test-Driven Development (NON-NEGOTIABLE)
✅ **PASS** - TDD will be followed: write tests first for DayTagService, validation logic, store actions, and UI components. Target: 90% coverage for tag operations, 80% overall. Existing test infrastructure (Jest + React Native Testing Library) supports fast execution.

### III. User Experience Consistency
✅ **PASS** - UI will follow established design patterns (same Button, Card, Input components). Calendar integration uses existing react-native-calendars component. Tag UI will match existing note tags pattern. Performance targets align with spec (tag display <2s, filtering <3s). Accessibility labels on all interactive elements per WCAG 2.1 AA.

### IV. Performance & Scalability
✅ **PASS** - Day tag queries will be indexed by date. Expected load: ~20 active tags, ~1000 entries. Current architecture handles this scale. Memory impact minimal (tags are lightweight text). Filtering logic will use efficient SQL queries via Drizzle ORM. No architectural changes needed.

### V. Security & Maintainability
✅ **PASS** - No new dependencies required (uses existing stack). Code will be modular (separate service, store, components). Documentation will be maintained alongside code (JSDoc comments, type definitions). No security vulnerabilities introduced (local-only data, no external APIs).

**Overall Status**: ✅ ALL GATES PASS - No constitution violations. Feature aligns with all core principles.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 0 (Research) and Phase 1 (Design) complete.*

### I. Code Quality & Standards
✅ **PASS** - Design follows established patterns documented in research.md. All new code will use existing components (Button, Card, Input), follow service/store/component architecture. Contracts define clear interfaces. TypeScript strict mode enforced throughout.

### II. Test-Driven Development
✅ **PASS** - Quickstart guide mandates TDD approach (write tests first, then implement). Test coverage targets confirmed: 90% for services, 80% overall. Test files created in contracts with example test cases. All critical paths (tag CRUD, filtering, inheritance) have test scenarios defined.

### III. User Experience Consistency
✅ **PASS** - Design uses existing UI components and patterns. Tag visual design (orange vs blue) provides clear distinction while maintaining iOS design language. Calendar integration leverages existing react-native-calendars. Accessibility labels defined in type contracts. Performance targets from spec maintained in design.

### IV. Performance & Scalability
✅ **PASS** - Data model includes proper indexes (date, tagId) for fast queries. Caching strategy defined in research.md (selective, monthly). Query patterns optimized (prepared statements, batch operations). Performance targets validated: tag ops <2s, filtering <3s for 1000 entries. No architectural changes needed, scales to 10x current load.

### V. Security & Maintainability
✅ **PASS** - No new dependencies added (uses existing stack). Code modular with clear separation: services (business logic), stores (state), components (UI). Validation rules prevent injection (TAG_VALIDATION.FORBIDDEN_CHARS). Comprehensive documentation: research.md, data-model.md, contracts/, quickstart.md. Migration strategy defined, rollback plan included.

**Post-Design Status**: ✅ ALL GATES PASS - Design validated, ready for implementation (/speckit.tasks).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── db/
│   ├── schema.ts                    # [MODIFY] Add dayTags table definition
│   └── client.ts                    # [NO CHANGE] Database client
├── services/
│   ├── dayTagService.ts             # [NEW] Day tag CRUD operations
│   ├── entryService.ts              # [MODIFY] Extend filtering for day tags
│   ├── exportService.ts             # [MODIFY] Include day tags in exports
│   └── validationService.ts         # [MODIFY] Add tag validation rules
├── stores/
│   ├── dayTagStore.ts               # [NEW] Zustand store for day tag state
│   └── entryStore.ts                # [MODIFY] Add tag filtering actions
├── components/
│   ├── Calendar/
│   │   ├── CalendarComponent.tsx    # [MODIFY] Show tag indicators
│   │   └── DayTagIndicator.tsx      # [NEW] Visual tag badges on calendar
│   ├── DayTags/
│   │   ├── DayTagManager.tsx        # [NEW] Modal for managing day tags
│   │   ├── DayTagPicker.tsx         # [NEW] Tag selection/autocomplete
│   │   ├── DayTagBadge.tsx          # [NEW] Tag display component
│   │   └── DayTagFilter.tsx         # [NEW] Filter UI component
│   ├── Timeline/
│   │   └── TimelineItem.tsx         # [MODIFY] Display inherited day tags
│   └── Forms/
│       └── DateRangePicker.tsx      # [MODIFY] Add tag filter option
├── types/
│   └── dayTag.ts                    # [NEW] TypeScript types for day tags
├── utils/
│   └── tagUtils.ts                  # [NEW] Tag normalization, parsing helpers
└── screens/
    └── (no new screens needed, modals integrated into existing flows)

app/
├── (tabs)/
│   ├── timeline.tsx                 # [MODIFY] Add tag filter UI
│   ├── calendar.tsx                 # [MODIFY] Add tag management trigger
│   └── export.tsx                   # [MODIFY] Add tag-based export options
└── entry/
    └── [id].tsx                     # [MODIFY] Show inherited day tags

__tests__/
├── services/
│   └── dayTagService.test.ts        # [NEW] Service layer tests
├── stores/
│   └── dayTagStore.test.ts          # [NEW] Store tests
├── components/
│   └── DayTags/                     # [NEW] Component tests
└── utils/
    └── tagUtils.test.ts             # [NEW] Utility tests

drizzle/
└── migrations/                      # [NEW] Migration for dayTags table
    └── NNNN_add_day_tags.sql
```

**Structure Decision**: React Native mobile app structure (Option 3 equivalent). Feature follows existing architectural patterns: database schema in `src/db/`, business logic in `src/services/`, state management in `src/stores/`, UI in `src/components/`, and screens in `app/`. New code will be modular and isolated where possible, with minimal modifications to existing files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. All complexity justified by existing architecture patterns.
