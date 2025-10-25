# Feature Specification: Crohns Symptom Tracker

**Feature Branch**: `001-crohns-tracker`
**Created**: 2025-10-25
**Status**: Draft
**Input**: User description: "Build a mobile app that will help me track my Crohns symptoms. The application should present a calendar and with a tap or two i should be able to record either a bowel movement, with interesting properties like consistancy, or a note, which could be anything from what i ate to that i did some exercise or took some medication. The bowel movements and notes should presented as a timeline for a given day. All of the data is stored locally, but I want an export option so that I can export the data in a given data range as a txt file or csv file that I can feed to an AI to analyze for patterns."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Symptom Logging (Priority: P1)

A user with Crohns disease needs to quickly log bowel movements with relevant properties throughout their day, using minimal taps on their mobile device. They open the app, tap on today's date or current time, select "bowel movement", choose consistency level (using standard Bristol Stool Chart scale), and save the entry within 15 seconds.

**Why this priority**: This is the core value proposition - quick, easy symptom tracking is essential for Crohns management and forms the foundation for all other features.

**Independent Test**: Can be fully tested by opening the app, tapping twice to record a bowel movement with consistency rating, and verifying the entry is saved and visible.

**Acceptance Scenarios**:

1. **Given** user opens the app on current day, **When** they tap today's date and select "bowel movement" with consistency level 4, **Then** entry is saved with timestamp and consistency data
2. **Given** user wants to log a symptom from 2 hours ago, **When** they adjust the time and log the bowel movement, **Then** entry is saved with correct historical timestamp
3. **Given** user attempts to log without selecting consistency, **When** they try to save, **Then** system prompts for required consistency rating

---

### User Story 2 - Daily Timeline Review (Priority: P2)

A user wants to review their daily symptom patterns by viewing a chronological timeline of all entries (bowel movements and notes) for any selected day. They tap on a calendar date and see a vertical timeline showing all entries with timestamps, types, and key details.

**Why this priority**: Pattern recognition within a day is crucial for understanding triggers and symptoms, and provides immediate value from logged data.

**Independent Test**: Can be fully tested by logging multiple entries throughout a day, then viewing the timeline to see chronological order and entry details.

**Acceptance Scenarios**:

1. **Given** user has logged 3 bowel movements and 2 notes on a day, **When** they view that day's timeline, **Then** all 5 entries appear in chronological order with timestamps
2. **Given** user selects a day with no entries, **When** they view the timeline, **Then** they see an empty state with option to add first entry
3. **Given** user has entries spanning from early morning to late evening, **When** they scroll the timeline, **Then** they can view all entries without performance issues

---

### User Story 3 - General Notes Tracking (Priority: P3)

A user wants to record contextual information that might affect their symptoms, including food intake, exercise, medications, stress levels, or other observations. They tap to add a note, select a category (food/exercise/medication/other), add descriptive text, and save the entry.

**Why this priority**: Contextual data is valuable for pattern analysis but not essential for basic symptom tracking functionality.

**Independent Test**: Can be fully tested by adding various types of notes with different categories and verifying they appear in the timeline alongside symptom entries.

**Acceptance Scenarios**:

1. **Given** user wants to log a meal, **When** they add a note with "food" category and description "pizza with pepperoni", **Then** entry is saved with food icon and appears in timeline
2. **Given** user takes medication, **When** they log a note with "medication" category and dosage details, **Then** entry is categorized and timestamped correctly
3. **Given** user adds a note without selecting a category, **When** they save, **Then** system defaults to "other" category

---

### User Story 4 - Data Export for Analysis (Priority: P4)

A user wants to export their symptom and notes data for a specific date range to analyze patterns using external tools or AI. They select a date range, choose export format (CSV or TXT), and generate a file that can be shared or analyzed.

**Why this priority**: Critical for long-term pattern analysis but not needed for daily tracking workflow.

**Independent Test**: Can be fully tested by selecting a date range with existing data, exporting to CSV format, and verifying the file contains properly formatted data with all logged entries.

**Acceptance Scenarios**:

1. **Given** user has data spanning 30 days, **When** they export the full range as CSV, **Then** file contains all entries with date, time, type, and details in structured format
2. **Given** user selects a range with no data, **When** they attempt export, **Then** system provides appropriate message and option to select different range
3. **Given** user exports as TXT format, **When** file is generated, **Then** data is formatted in human-readable format suitable for AI analysis

---

### Edge Cases

- What happens when user attempts to log future dates beyond today?
- How does system handle rapid successive entries within the same minute?
- What happens when export date range spans very large periods (multiple years)?
- How does system behave when device storage is nearly full during logging or export?
- What happens when user attempts to export with no data in selected range?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a calendar interface for date selection and navigation with support for at least 2 years of historical data
- **FR-002**: System MUST allow logging of bowel movements with consistency ratings using Bristol Stool Chart scale (1-7) and urgency level (1-4 scale: none, mild, moderate, urgent)
- **FR-003**: System MUST allow logging of general notes with categories (food, exercise, medication, other)
- **FR-004**: System MUST enable entry logging within 2 taps from main calendar view
- **FR-005**: System MUST display daily timeline view showing all entries in chronological order
- **FR-006**: System MUST store all data locally on device without requiring internet connection
- **FR-013**: System MUST support both iOS and Android platforms with consistent functionality
- **FR-007**: System MUST provide data export functionality for user-selected date ranges and open system sharing dialog for file distribution
- **FR-008**: System MUST support CSV export format with structured data columns
- **FR-009**: System MUST support TXT export format in human-readable format for AI analysis
- **FR-010**: System MUST allow users to edit or delete previously logged entries
- **FR-011**: System MUST automatically timestamp all entries with date and time
- **FR-012**: System MUST persist data across app sessions and device restarts
- **FR-014**: System MUST provide data import functionality to restore from previously exported backup files

### Key Entities

- **Entry**: Base record with timestamp, type (bowel movement or note), and user-entered data
- **Bowel Movement**: Specialized entry containing consistency rating (1-7 Bristol scale) and urgency level (1-4 scale)
- **Note**: Specialized entry containing category (food/exercise/medication/other) and descriptive text content
- **Day Timeline**: Aggregated view of all entries for a specific calendar date, ordered chronologically

## Clarifications

### Session 2025-10-25

- Q: What mobile platforms should the app support? → A: iOS and Android (cross-platform)
- Q: What additional symptom data should be tracked beyond consistency? → A: Add urgency level, but not pain level or blood
- Q: How should exported files be made available to users? → A: Save and open system sharing dialog
- Q: What data backup and recovery options should be available? → A: Manual export/import for backup purposes
- Q: What calendar date range should the app support? → A: 2+ years of historical data

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can log a bowel movement entry in under 15 seconds from app opening
- **SC-002**: Users can log a note entry in under 20 seconds from app opening
- **SC-003**: Timeline view displays 50+ entries for a busy day without performance degradation
- **SC-004**: Data export completes within 30 seconds for 1 year of data (estimated 1000+ entries)
- **SC-005**: App launches in under 3 seconds on modern mobile devices
- **SC-006**: 100% of logged data is preserved across app sessions and device restarts
- **SC-007**: Export files maintain data integrity with no loss of information
- **SC-008**: Users can navigate calendar and access any historical date within 5 seconds