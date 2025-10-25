# Research & Design Decisions: Day Tags

**Feature**: Day Tags
**Date**: 2025-10-25
**Status**: Complete

## Overview

This document captures key design decisions, research findings, and rationale for the Day Tags feature implementation. All decisions are informed by existing codebase patterns, React Native/Expo best practices, and the feature requirements.

## Key Design Decisions

### 1. Database Schema: Day Tags Storage Strategy

**Decision**: Create a separate `dayTags` table with a many-to-many relationship through a `dayTagAssociations` table.

**Rationale**:
- **Normalization**: Prevents duplicate tag strings (e.g., "vacation" stored once, referenced many times)
- **Efficient queries**: Can query all days with a specific tag using indexed lookups
- **Tag reuse**: Supports autocomplete/suggestion features (FR-013)
- **Case-insensitive matching**: Single source of truth for tag names
- **Performance**: Indexed foreign keys enable fast filtering (SC-002: <3s for 1000+ entries)

**Schema Design**:
```typescript
// dayTags table - stores unique tag names
{
  id: integer (PK, autoincrement),
  name: text (unique, lowercase normalized),
  displayName: text (preserves user capitalization),
  createdAt: text (timestamp),
  usageCount: integer (denormalized for performance)
}

// dayTagAssociations table - links tags to dates
{
  id: integer (PK, autoincrement),
  tagId: integer (FK → dayTags.id, CASCADE DELETE),
  date: text (YYYY-MM-DD format),
  createdAt: text (timestamp),
  UNIQUE(tagId, date)  // Prevent duplicate tag-date pairs
}
```

**Alternatives Considered**:
- **JSON array in entries table**: Rejected - violates DRY, makes filtering inefficient, harder to manage retroactive application
- **Comma-separated tags per date**: Rejected - no referential integrity, harder to query, no autocomplete support
- **Single table with date+tags**: Rejected - duplication of tag names, harder to maintain consistency

**Migration Strategy**:
- Use Drizzle migration to create tables with proper indexes
- Index `dayTagAssociations.date` for fast date-based lookups
- Index `dayTagAssociations.tagId` for fast tag-based filtering
- No data migration needed (new feature, no existing data)

### 2. Tag Inheritance: Computed vs Stored

**Decision**: Compute tag inheritance dynamically at query time (not stored on entries).

**Rationale**:
- **FR-005 compliance**: Retroactive application "just works" - no need to update existing entries
- **FR-006 compliance**: Tag deletion automatically reflects on all affected entries
- **Consistency**: Single source of truth (dayTagAssociations table)
- **Storage efficiency**: No duplication of tag data
- **Simpler logic**: No synchronization needed when tags change

**Implementation Approach**:
```typescript
// When fetching entries, JOIN with dayTagAssociations by date
SELECT entries.*, dayTags.displayName as dayTags
FROM entries
LEFT JOIN dayTagAssociations ON entries.date = dayTagAssociations.date
LEFT JOIN dayTags ON dayTagAssociations.tagId = dayTags.id
WHERE entries.date = ?
```

**Alternatives Considered**:
- **Store tags on entries**: Rejected - requires complex sync logic, violates single source of truth
- **Hybrid approach**: Rejected - added complexity without clear benefits

### 3. Tag Normalization & Case Sensitivity

**Decision**: Store normalized lowercase version for matching, preserve display version for UI.

**Rationale**:
- **Spec assumption**: "Tags are case-insensitive for matching purposes"
- **User experience**: "Vacation", "vacation", "VACATION" treated as same tag
- **Display preservation**: Show user's preferred capitalization in UI
- **Autocomplete**: Match on normalized, suggest with display name

**Implementation**:
```typescript
function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function createOrGetTag(displayName: string): Promise<DayTag> {
  const normalized = normalizeTag(displayName);
  // Check if normalized exists, reuse if so, otherwise create with both versions
}
```

**Alternatives Considered**:
- **Case-sensitive tags**: Rejected - creates user confusion and duplicates
- **Always lowercase**: Rejected - loses user intent for display

### 4. Calendar UI: Tag Indicators

**Decision**: Show colored dot indicators on calendar days with tags, with multi-tag visual cues.

**Rationale**:
- **Existing pattern**: Calendar already uses dots for days with entries
- **Visual distinction**: Use different color for tagged days (e.g., orange vs blue)
- **Multiple tags**: Show multiple dots or gradient indicator
- **Performance**: Pre-compute marked dates object, minimal render impact
- **Accessibility**: Add accessibility hints for screen readers

**Visual Design**:
```typescript
markedDates = {
  [date]: {
    marked: true,
    dots: [
      { key: 'entry', color: '#007AFF' },      // Existing entries
      { key: 'tag', color: '#FF9500' }         // Day has tags
    ],
    accessibilityLabel: 'Date has 3 entries and 2 tags: vacation, new medicine'
  }
}
```

**Alternatives Considered**:
- **Badge numbers**: Rejected - clutters calendar, harder to read
- **Background colors**: Rejected - conflicts with selection state
- **Icon overlays**: Rejected - too small on mobile, accessibility issues

### 5. Tag Input UI: Autocomplete vs Manual Entry

**Decision**: Combined approach - text input with autocomplete suggestions below.

**Rationale**:
- **FR-013 requirement**: Must support reusing existing tags
- **Flexibility**: Users can create new tags or select existing ones
- **Mobile-friendly**: Works with native keyboard, no custom components needed
- **Performance**: Query existing tags as user types (debounced)
- **Existing pattern**: Similar to note tags input, familiar to users

**Component Design**:
```typescript
<DayTagPicker
  selectedTags={string[]}
  onTagsChange={(tags: string[]) => void}
  existingTags={string[]}          // From store
  maxTags={10}                      // Reasonable limit
  placeholder="Add tag (e.g., vacation, new medicine)"
/>
```

**Alternatives Considered**:
- **Pure autocomplete dropdown**: Rejected - harder to create new tags, mobile UX issues
- **Chip selector only**: Rejected - doesn't support new tag creation
- **Multi-select modal**: Rejected - more taps required, slower workflow

### 6. Filtering: Single vs Multi-Tag Selection

**Decision**: Support both single tag filter and multi-tag filter (AND/OR logic).

**Rationale**:
- **User Story 3**: Primarily single-tag filtering ("filter by new medicine")
- **Advanced use case**: Users may want "vacation AND new medicine" analysis
- **Progressive disclosure**: Default to single tag, show "Add another tag" option
- **Export integration**: Filter applies to export (User Story 4)

**Filter UI**:
```typescript
interface TagFilter {
  tags: string[];           // Selected tag names
  matchMode: 'any' | 'all'; // OR vs AND logic
}

// SQL for 'all' mode:
// Entries where date has ALL specified tags
// SQL for 'any' mode:
// Entries where date has ANY specified tag
```

**Alternatives Considered**:
- **Single tag only**: Rejected - limits analytical capabilities
- **Complex query builder**: Rejected - over-engineering, 95% of users need simple filtering

### 7. Export: Tag Inclusion Format

**Decision**: Add "Day Tags" column to CSV, include in TXT as section header.

**Rationale**:
- **FR-009 requirement**: Export must include day tags with entries
- **CSV format**: New column easy to parse in spreadsheet software
- **TXT format**: Human-readable, groups by date already
- **Filter indication**: Export metadata indicates which tags were filtered
- **Backward compatibility**: Existing exports without tags still work

**Export Format**:
```csv
Date,Time,Type,Day Tags,Consistency,Urgency,Category,Content,Notes,Entry Tags
2025-10-25,08:30,bowel_movement,"vacation, new medicine",4,2,,,Sample note,
```

```text
Crohns Tracker Export (Filtered by tags: new medicine)
Date Range: 2025-10-01 to 2025-10-31
Generated: 2025-10-25

=== 2025-10-25 (Friday) ===
Day Tags: vacation, new medicine

08:30 - Bowel Movement
  Consistency: Type 4 (Normal)
  Urgency: Moderate
  Notes: Sample note
```

**Alternatives Considered**:
- **Separate tags file**: Rejected - harder to correlate with entries
- **JSON export**: Rejected - not user-friendly for non-technical users

### 8. Performance: Caching & Optimization

**Decision**: Implement selective caching at store level, leverage SQL indexes.

**Rationale**:
- **SC-001**: Tag operations <2s - achieved via indexed queries
- **SC-002**: Filtering <3s for 1000 entries - use SQL filtering, not JS
- **Calendar render <100ms**: Pre-fetch tagged dates for current month
- **Memory constraints**: Cache only current month's tag associations
- **Offline-first**: All operations use local SQLite, no network latency

**Optimization Strategies**:
```typescript
// Store caches:
- Current month's dayTagAssociations (cleared on month change)
- All unique tag names (for autocomplete, refreshed on create/delete)
- Currently filtered entries (cleared on filter change)

// SQL indexes:
CREATE INDEX idx_day_tag_assoc_date ON dayTagAssociations(date);
CREATE INDEX idx_day_tag_assoc_tag ON dayTagAssociations(tagId);
CREATE INDEX idx_day_tags_name ON dayTags(name);

// Query optimization:
- Use Drizzle's prepared statements for repeated queries
- Batch operations (e.g., add multiple tags to one day in single transaction)
- Lazy load tags (don't fetch unless needed)
```

**Alternatives Considered**:
- **No caching**: Rejected - calendar would re-query on every render
- **Cache everything**: Rejected - memory constraints, stale data risk
- **React Query**: Rejected - overkill for local-only data, Zustand sufficient

### 9. Validation: Tag Constraints

**Decision**: Enforce length limits, character restrictions, and reasonable tag count per day.

**Rationale**:
- **Edge case prevention**: Very long tags break UI layouts
- **Data quality**: Special characters can cause parsing issues
- **Performance**: Too many tags per day slow calendar render
- **User guidance**: Clear error messages guide proper usage

**Validation Rules**:
```typescript
const TAG_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  MAX_TAGS_PER_DAY: 10,
  ALLOWED_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,  // Alphanumeric, spaces, hyphens, underscores
  FORBIDDEN_CHARS: /[<>{}[\]\\\/|"']/,     // Prevent injection, parsing issues
};

// Error messages:
"Tag must be 1-50 characters"
"Tag can only contain letters, numbers, spaces, hyphens, and underscores"
"Maximum 10 tags per day"
"Tag already exists for this day"
```

**Alternatives Considered**:
- **No restrictions**: Rejected - opens door to data quality issues
- **Very strict (alpha only)**: Rejected - prevents natural language tags like "medicine-2"
- **Unlimited tags**: Rejected - UI becomes unusable with 50+ tags per day

### 10. Visual Distinction: Day Tags vs Entry Tags

**Decision**: Use distinct visual styling - day tags have orange accent, entry tags have blue accent.

**Rationale**:
- **FR-007 requirement**: Must visually distinguish inherited day tags from entry-level tags
- **Color coding**: Leverages human visual processing for quick identification
- **Existing pattern**: Notes already have tags (blue), extend pattern with new color
- **Accessibility**: Use both color AND icon/label for colorblind users
- **Consistency**: All day tags use same style across app

**Visual Design**:
```typescript
// Day Tag Badge (orange theme)
<View style={styles.dayTagBadge}>  {/* backgroundColor: '#FFF3E0', borderColor: '#FF9500' */}
  <Icon name="calendar" size={12} color="#FF9500" />
  <Text style={styles.dayTagText}>{tag}</Text>
</View>

// Entry Tag Badge (blue theme)
<View style={styles.entryTagBadge}>  {/* backgroundColor: '#E3F2FD', borderColor: '#007AFF' */}
  <Icon name="tag" size={12} color="#007AFF" />
  <Text style={styles.entryTagText}>{tag}</Text>
</View>

// Accessibility
accessibilityLabel="Day tag: vacation"  // vs "Entry tag: important"
```

**Alternatives Considered**:
- **Text prefix only**: Rejected - clutters UI, harder to scan visually
- **Same style with icon**: Rejected - icons too small to distinguish on mobile
- **Separate sections**: Rejected - takes up too much vertical space

## Technology Choices & Best Practices

### Drizzle ORM Patterns

**Best Practice**: Use Drizzle's type-safe query builder for all database operations.

**Rationale**:
- Existing codebase uses Drizzle consistently
- Type safety prevents runtime errors
- Migrations managed via `drizzle-kit`
- Prepared statements for performance

**Example**:
```typescript
// Define schema
export const dayTags = sqliteTable('dayTags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  displayName: text('displayName').notNull(),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  usageCount: integer('usageCount').default(0),
});

// Type-safe query
const tag = await db.select().from(dayTags).where(eq(dayTags.name, normalized)).get();
```

### Zustand State Management Patterns

**Best Practice**: Follow existing store pattern - separate concerns, minimal side effects in store.

**Rationale**:
- Existing stores follow this pattern (entryStore, exportStore)
- Services handle business logic, stores handle state + UI coordination
- Async operations return promises, store manages loading states
- Selectors for derived state

**Example**:
```typescript
interface DayTagState {
  // Data
  allTags: DayTag[];
  selectedTags: string[];
  taggedDates: Record<string, string[]>;  // date -> tag names

  // Loading
  isLoadingTags: boolean;
  isCreatingTag: boolean;

  // Actions
  loadAllTags: () => Promise<void>;
  loadTagsForDate: (date: string) => Promise<string[]>;
  addTagToDay: (date: string, tagName: string) => Promise<void>;
  removeTagFromDay: (date: string, tagName: string) => Promise<void>;

  // Filters
  currentFilter: TagFilter | null;
  setFilter: (filter: TagFilter) => void;
  clearFilter: () => void;
}
```

### React Native UI Patterns

**Best Practice**: Use existing UI component library (Button, Card, Input), extend with new DayTags components.

**Rationale**:
- Consistency with existing UI (User Experience principle)
- Accessibility built-in to existing components
- iOS design language already established
- Reusable modal patterns (similar to DateRangePicker)

**Component Hierarchy**:
```
DayTagManager (Modal)
├── DayTagPicker (Input + Autocomplete)
│   ├── Input (existing)
│   └── FlatList (suggestions)
├── DayTagBadge (display)
│   ├── Pressable (for deletion)
│   └── Text
└── Button (existing - Save/Cancel)

DayTagFilter (inline filter UI)
├── DayTagBadge (selected tags)
└── Button (existing - Clear filter)
```

### Testing Strategy

**Best Practice**: Follow TDD - write tests before implementation, maintain 90%+ coverage for business logic.

**Test Structure**:
```typescript
// Service tests (pure functions, easy to test)
describe('DayTagService', () => {
  describe('createTag', () => {
    it('creates a new tag with normalized name');
    it('reuses existing tag if normalized name matches');
    it('validates tag constraints');
    it('throws error for invalid tag format');
  });

  describe('getTagsForDate', () => {
    it('returns all tags for a specific date');
    it('returns empty array for untagged date');
  });

  describe('getEntriesWithTag', () => {
    it('filters entries by single tag');
    it('filters entries by multiple tags with AND logic');
    it('filters entries by multiple tags with OR logic');
    it('handles date range constraints');
  });
});

// Store tests (state management, async)
describe('useDayTagStore', () => {
  beforeEach(() => {
    // Reset store, mock service
  });

  it('loads all tags on mount');
  it('adds tag to day and updates state');
  it('removes tag from day and updates state');
  it('handles errors gracefully');
  it('manages loading states correctly');
});

// Component tests (UI, user interaction)
describe('DayTagPicker', () => {
  it('renders input field');
  it('shows autocomplete suggestions on typing');
  it('adds tag on suggestion tap');
  it('adds tag on keyboard enter');
  it('validates tag before adding');
  it('shows error message for invalid tags');
  it('displays selected tags as badges');
  it('removes tag on badge press');
  it('enforces max tags limit');
});
```

## Migration & Rollout Strategy

### Database Migration

**Approach**: Use Drizzle Kit to generate and apply migration.

**Steps**:
1. Add table definitions to `src/db/schema.ts`
2. Run `npx drizzle-kit generate:sqlite` to create migration SQL
3. Migration automatically applied on app launch (expo-sqlite)
4. No user data affected (new tables, no existing data)

**Rollback Plan**:
- If migration fails, app detects schema version mismatch
- User prompted to reinstall (acceptable for beta/internal users)
- Production: test migration on copy of production DB first

### Feature Rollout

**Phase 1: Core Tagging (P1 User Story)**
- Database tables, service, store
- DayTagManager modal
- Calendar integration (add/view tags)
- Tests for core functionality

**Phase 2: Auto-Inheritance (P2 User Story)**
- Modify entry queries to include day tags
- Update TimelineItem to display inherited tags
- Tests for inheritance logic

**Phase 3: Filtering (P3 User Story)**
- DayTagFilter component
- Store filter actions
- Timeline/Export screen integration
- Tests for filtering

**Phase 4: Export (P4 User Story)**
- Extend ExportService
- Update CSV/TXT formatters
- Tests for export functionality

**Progressive Disclosure**:
- Tag feature initially hidden (user must tap calendar day to discover)
- Onboarding tooltip: "Tap a day to add context tags"
- In-app help explaining tag inheritance

## Open Questions & Future Considerations

### Resolved for MVP
- ✅ **Tag categories**: No - adds complexity, user can prefix tags (e.g., "med: aspirin")
- ✅ **Tag colors**: No - consistent orange for all day tags (visual distinction from blue entry tags)
- ✅ **Tag statistics**: No - not in spec, can add later (e.g., "most used tags")
- ✅ **Bulk tag operations**: No - not in spec, can add later (e.g., "tag all Mondays")

### Future Enhancements (Post-MVP)
- **Smart tag suggestions**: ML-based suggestions based on patterns (e.g., "vacation" often paired with "travel")
- **Tag templates**: Pre-defined tag sets (e.g., "Medication Trial" bundle: "medication", "side-effects", "dosage")
- **Calendar view filters**: Hide/show only tagged days in calendar view
- **Tag analytics**: Heatmap of tags over time, correlation analysis
- **Cross-device sync**: When sync feature is added, include day tags

### Performance Monitoring (Post-Launch)
- Monitor actual tag operation times vs SC-001/SC-002 targets
- Track calendar render performance with tagged dates
- Measure memory usage with 100+ tags, 1000+ entries
- A/B test autocomplete vs pure manual entry

## References

- Feature Spec: `/specs/002-day-tags/spec.md`
- Existing Schema: `/src/db/schema.ts`
- Drizzle ORM Docs: https://orm.drizzle.team/
- React Native Calendars: https://github.com/wix/react-native-calendars
- Zustand Best Practices: https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/

## Approval & Sign-off

**Research Complete**: 2025-10-25
**Reviewed By**: Implementation planning (automated)
**Status**: ✅ Approved - All design decisions finalized, ready for Phase 1 (data model & contracts)
