# Feature Specification: Day Tags

**Feature Branch**: `002-day-tags`
**Created**: 2025-10-25
**Status**: Draft
**Input**: User description: "i want the ability to tag days, and any entry on that day would automatically have those tags. for example, if i'm on vacation, i want that day to be tagged as vacation so i can look back later and see specific days in which i was on vacation and how that affected my symptoms. i'd also like some options for working with day tags, like for example if i'm trying out a new medicine, i might want to export or view only entries on days that are tagged with that new medicine name"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Day Tagging (Priority: P1)

A user wants to mark specific days with contextual tags (e.g., "vacation", "new medicine", "stressful week") so they can later correlate these contexts with their symptom patterns. They need the ability to add, edit, and remove tags from any calendar day.

**Why this priority**: This is the foundational capability that enables all other functionality. Without the ability to tag days, none of the filtering or analysis features can work.

**Independent Test**: Can be fully tested by navigating to any calendar day, adding one or more tags, viewing those tags on the calendar, and removing tags. Delivers immediate value by allowing users to annotate their tracking history.

**Acceptance Scenarios**:

1. **Given** I'm viewing the calendar, **When** I select a specific day, **Then** I can add one or more tags to that day
2. **Given** a day has existing tags, **When** I view that day on the calendar, **Then** I can see all tags associated with that day
3. **Given** a day has one or more tags, **When** I choose to edit or remove tags, **Then** I can modify or delete existing tags
4. **Given** I'm viewing the calendar month view, **When** days have tags, **Then** I can visually identify which days are tagged

---

### User Story 2 - Automatic Tag Inheritance (Priority: P2)

A user logs symptom entries throughout the day. They want those entries to automatically inherit any tags assigned to that day, so they can later filter and analyze entries by context without manually tagging each individual entry.

**Why this priority**: This is the core value proposition—automatic correlation between day context and symptom entries. It eliminates manual work and ensures consistency.

**Independent Test**: Can be tested by tagging a day with "vacation", creating new entries on that day, and verifying those entries show the inherited "vacation" tag. Delivers value by automating the correlation process.

**Acceptance Scenarios**:

1. **Given** a day has been tagged with "vacation", **When** I create a new bowel movement or note entry on that day, **Then** the entry automatically inherits the "vacation" tag
2. **Given** an entry was created on a tagged day, **When** I view that entry's details, **Then** I can see the inherited day tags clearly distinguished from any manual entry-level tags
3. **Given** I add a new tag to a day that already has entries, **When** I view those existing entries, **Then** they all show the newly added day tag
4. **Given** I remove a day tag, **When** I view entries from that day, **Then** the removed tag no longer appears on those entries

---

### User Story 3 - Filter and View by Day Tags (Priority: P3)

A user has been taking a new medication and has tagged those days with the medication name. They want to view only the entries from those tagged days to analyze if the medication is affecting their symptoms.

**Why this priority**: Enables users to perform the analysis they need to understand correlations between contexts and symptoms. This is the primary analytical use case.

**Independent Test**: Can be tested by creating entries across multiple days with different tags, then filtering to show only entries from days tagged with a specific tag. Delivers value by enabling pattern analysis.

**Acceptance Scenarios**:

1. **Given** I have entries across multiple days with various day tags, **When** I apply a filter for a specific day tag, **Then** I see only entries from days that have that tag
2. **Given** I'm viewing filtered entries, **When** I want to see the full context, **Then** I can see which day each entry came from and what other tags that day had
3. **Given** I've applied a day tag filter, **When** I navigate the calendar, **Then** I only see days that match the filter criteria highlighted or displayed
4. **Given** a day has multiple tags, **When** I filter by any one of those tags, **Then** entries from that day appear in the filtered results

---

### User Story 4 - Export Filtered Data (Priority: P4)

A user wants to share their symptom data with their healthcare provider, but only for the period when they were trying a specific medication. They want to export entries from days tagged with that medication name.

**Why this priority**: Enables external sharing and analysis. Less critical than the in-app filtering but important for healthcare collaboration.

**Independent Test**: Can be tested by filtering entries by a day tag and triggering an export. Delivers value by enabling data portability for medical consultations.

**Acceptance Scenarios**:

1. **Given** I have filtered entries by a specific day tag, **When** I choose to export the data, **Then** I receive an export containing only entries from days with that tag
2. **Given** I'm exporting filtered data, **When** the export is generated, **Then** the export includes information about which day tags were used as filters
3. **Given** exported data includes entries from tagged days, **When** viewing the export, **Then** I can see the day tags associated with each entry for context

---

### Edge Cases

- What happens when a user adds a day tag to a day with many existing entries (performance consideration)?
- How does the system handle very long tag names or special characters in tag names?
- What happens if a user deletes all tags from a day that has entries—do the entries remain accessible?
- Can users search for day tags across the entire history?
- What happens when viewing entries that span midnight—which day's tags do they inherit?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add one or more text-based tags to any calendar day
- **FR-002**: System MUST allow users to view all tags associated with a specific day
- **FR-003**: System MUST allow users to edit or remove existing day tags
- **FR-004**: System MUST automatically associate all entries created on a tagged day with that day's tags
- **FR-005**: System MUST retroactively apply day tags to existing entries when a tag is added to a past day
- **FR-006**: System MUST remove day tag associations from entries when a day tag is deleted
- **FR-007**: System MUST visually distinguish day-inherited tags from any other entry-level tags
- **FR-008**: System MUST allow users to filter entries by one or more day tags
- **FR-009**: System MUST allow users to export entries filtered by day tags
- **FR-010**: System MUST display day tags in a way that makes tagged days easily identifiable on the calendar view
- **FR-011**: System MUST persist day tags and their associations with days across app restarts
- **FR-012**: System MUST support multiple tags per day
- **FR-013**: System MUST allow users to reuse existing day tags when tagging new days (tag autocomplete or selection)

### Key Entities

- **Day Tag**: A text label that can be assigned to a calendar day to provide context (e.g., "vacation", "new medication - Drug X", "high stress period"). A day can have zero or more tags, and the same tag can be applied to multiple days.
- **Day-Tag Association**: The relationship between a specific calendar day and a day tag, including when the association was created.
- **Entry-Tag Inheritance**: The automatic relationship between an entry and the day tags from the day on which the entry was created. This is derived dynamically from the entry's date and the day's tags.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can tag a day and see the tag appear on the calendar within 2 seconds
- **SC-002**: Users can filter their entry history by day tags and see results within 3 seconds for up to 1000 entries
- **SC-003**: 95% of users successfully create their first day tag within 30 seconds of discovering the feature
- **SC-004**: Users can export filtered data that accurately reflects their day tag filter criteria
- **SC-005**: The calendar view clearly indicates which days have tags, allowing users to identify tagged days at a glance
- **SC-006**: Users can correlate life events with symptom patterns by comparing entries from tagged vs. untagged days

## Assumptions

- Users will typically have fewer than 20 distinct day tags in active use at any time
- Most days will have 0-3 tags applied
- Users will primarily interact with day tags through a calendar interface
- The existing entry export functionality can be extended to support filtered exports
- Day tags are personal to the user and don't need to be shared across users or devices (until sync is implemented)
- Tags are case-insensitive for matching purposes (e.g., "Vacation" and "vacation" are treated as the same tag)
