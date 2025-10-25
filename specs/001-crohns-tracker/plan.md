# Implementation Plan: Crohns Symptom Tracker

**Branch**: `001-crohns-tracker` | **Date**: 2025-10-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-crohns-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Mobile app for tracking Crohns disease symptoms with calendar-based interface, quick logging of bowel movements with Bristol scale consistency and urgency ratings, note-taking for contextual data (food, exercise, medication), daily timeline visualization, and data export functionality for pattern analysis. Cross-platform support for iOS and Android with local data storage and manual backup/restore capabilities.

## Technical Context

**Language/Version**: TypeScript with React Native (Expo SDK 50+) and Node.js 18+
**Primary Dependencies**: Expo Router, React Native Calendars, Drizzle ORM, expo-sqlite, React Hook Form, Zustand (state management)
**Storage**: Local SQLite database managed through Drizzle ORM for structured data persistence
**Testing**: Jest with React Native Testing Library for unit/integration tests, Detox for E2E testing
**Target Platform**: iOS 15+ and Android 8+ (API level 26+) via Expo managed workflow
**Project Type**: Mobile - cross-platform React Native application with Expo
**Performance Goals**: App launch <3s, entry logging <15s, timeline display 50+ entries without lag, export <30s for 1 year data
**Constraints**: Offline-capable, local storage only, 100ms UI response time, WCAG 2.1 AA accessibility, reactive programming patterns
**Scale/Scope**: Single-user app, estimated 5-10 screens, ~1000 entries/year capacity, 2+ years historical data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Code Quality & Standards**: ✅ PASS
- TypeScript provides static typing and self-documenting code
- Expo/React Native ecosystem has established patterns and linting tools
- Code reviews mandatory for maintainability

**II. Test-Driven Development (NON-NEGOTIABLE)**: ✅ PASS
- Jest + React Native Testing Library for comprehensive testing
- TDD workflow planned with 90% critical path coverage target
- Fast test execution with Jest's parallel testing capabilities

**III. User Experience Consistency**: ✅ PASS
- React Native provides consistent cross-platform UI patterns
- Performance targets align: <100ms interactions, <3s load times
- Accessibility support via React Native's built-in accessibility props
- WCAG 2.1 AA compliance planned

**IV. Performance & Scalability**: ✅ PASS
- SQLite with Drizzle ORM provides efficient local data operations
- Reactive patterns with Zustand for optimized state management
- Performance monitoring planned for critical user flows
- Local-only architecture eliminates network scaling concerns

**V. Security & Maintainability**: ✅ PASS
- Local data storage eliminates external security vectors
- TypeScript and modular structure support maintainability
- Expo managed workflow provides automatic security updates
- Health data remains on device per privacy requirements

**Overall Gate Status**: ✅ APPROVED - All constitutional principles satisfied

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
├── components/           # Reusable UI components
│   ├── Calendar/
│   ├── Timeline/
│   ├── Forms/
│   └── UI/
├── screens/             # Screen components (pages)
│   ├── CalendarScreen/
│   ├── TimelineScreen/
│   ├── EntryFormScreen/
│   └── ExportScreen/
├── db/                  # Database schema and migrations
│   ├── schema.ts
│   ├── migrations/
│   └── client.ts
├── stores/              # Zustand state management
│   ├── entryStore.ts
│   ├── uiStore.ts
│   └── exportStore.ts
├── services/            # Business logic and data operations
│   ├── entryService.ts
│   ├── exportService.ts
│   └── validationService.ts
├── types/               # TypeScript type definitions
│   ├── entry.ts
│   ├── export.ts
│   └── ui.ts
├── utils/               # Utility functions
│   ├── dateUtils.ts
│   ├── formatters.ts
│   └── constants.ts
└── hooks/               # Custom React hooks
    ├── useEntries.ts
    ├── useCalendar.ts
    └── useExport.ts

__tests__/
├── components/          # Component unit tests
├── screens/             # Screen integration tests
├── services/            # Service unit tests
├── utils/               # Utility function tests
└── e2e/                 # End-to-end tests with Detox

app/                     # Expo Router app directory
├── (tabs)/              # Tab-based navigation
│   ├── calendar.tsx
│   ├── timeline.tsx
│   └── export.tsx
├── entry/               # Entry form modal/stack
│   ├── [id].tsx         # Edit entry
│   └── new.tsx          # New entry
├── _layout.tsx          # Root layout
└── index.tsx            # Entry point
```

**Structure Decision**: Expo Router-based React Native mobile application with feature-organized source structure. The `/app` directory follows Expo Router conventions for file-based routing, while `/src` contains the core application logic organized by functionality. Database operations are centralized in `/src/db` with Drizzle ORM, and state management uses Zustand stores for reactive data flow.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
