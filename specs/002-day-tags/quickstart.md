# Quickstart Guide: Day Tags Implementation

**Feature**: Day Tags
**Branch**: `002-day-tags`
**Date**: 2025-10-25

## Overview

This quickstart guide provides a step-by-step walkthrough for implementing the Day Tags feature. Follow this guide to build the feature incrementally, with working, testable code at each step.

**Estimated Time**: 8-12 hours for full implementation (following TDD)

## Prerequisites

- [x] Specification complete (`spec.md`)
- [x] Research complete (`research.md`)
- [x] Data model defined (`data-model.md`)
- [x] Contracts defined (`contracts/`)
- [x] Branch `002-day-tags` checked out
- [ ] Development environment ready (Expo Go or simulator running)

## Implementation Phases

### Phase 1: Foundation (Database & Types) - ~2 hours

**Goal**: Set up database schema and TypeScript types.

#### Step 1.1: Create Type Definitions (30 min)

```bash
# Create the types file
touch src/types/dayTag.ts
```

**Implementation**:
```typescript
// src/types/dayTag.ts
// Copy type definitions from contracts/TypeDefinitions.contract.ts
// Include: DayTag, DayTagAssociation, CreateTagInput, TagFilter, etc.
// Add validation constants: TAG_VALIDATION, TAG_STYLES
```

**Test**:
```bash
npm run lint  # Should pass with no type errors
```

#### Step 1.2: Update Database Schema (30 min)

```typescript
// src/db/schema.ts
import { sqliteTable, integer, text, index, unique } from 'drizzle-orm/sqlite-core';

export const dayTags = sqliteTable('dayTags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  displayName: text('displayName').notNull(),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
  usageCount: integer('usageCount').default(0),
}, (table) => ({
  nameIdx: index('idx_day_tags_name').on(table.name),
}));

export const dayTagAssociations = sqliteTable('dayTagAssociations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tagId: integer('tagId').notNull().references(() => dayTags.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  dateIdx: index('idx_day_tag_assoc_date').on(table.date),
  tagIdIdx: index('idx_day_tag_assoc_tag').on(table.tagId),
  uniqueTagDate: unique('idx_unique_tag_date').on(table.tagId, table.date),
}));
```

**Generate Migration**:
```bash
npx drizzle-kit generate:sqlite
# Review the generated migration in drizzle/migrations/
```

**Test**:
- Restart app (migration auto-applies on app start)
- Verify no database errors in console
- Optional: Use a SQLite browser to inspect new tables

#### Step 1.3: Update Database Client (15 min)

```typescript
// src/db/client.ts
// Export the new table schemas
export { dayTags, dayTagAssociations } from './schema';
```

**Test**:
```typescript
// Quick test in a component or service
import { db, dayTags } from '../db/client';
const allTags = await db.select().from(dayTags);
console.log('Tags:', allTags); // Should return empty array
```

---

### Phase 2: Service Layer (Business Logic) - ~3 hours

**Goal**: Implement DayTagService with TDD.

#### Step 2.1: Create Service File & Test Setup (20 min)

```bash
touch src/services/dayTagService.ts
touch __tests__/services/dayTagService.test.ts
```

**Test Setup**:
```typescript
// __tests__/services/dayTagService.test.ts
import { DayTagService } from '../../src/services/dayTagService';
import { db, dayTags, dayTagAssociations } from '../../src/db/client';

describe('DayTagService', () => {
  beforeEach(async () => {
    // Clear tables before each test
    await db.delete(dayTagAssociations);
    await db.delete(dayTags);
  });

  describe('createTag', () => {
    it('creates a new tag with normalized name', async () => {
      // RED: Write test first, it will fail
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });

      expect(tag).toBeDefined();
      expect(tag.name).toBe('vacation');  // Normalized
      expect(tag.displayName).toBe('Vacation');  // Preserved
      expect(tag.usageCount).toBe(0);
    });

    it('reuses existing tag if normalized name matches', async () => {
      // RED
      const tag1 = await DayTagService.createTag({ displayName: 'Vacation' });
      const tag2 = await DayTagService.createTag({ displayName: 'VACATION' });

      expect(tag1.id).toBe(tag2.id);  // Same tag
      expect(tag2.displayName).toBe('Vacation');  // Original preserved
    });

    it('validates tag name length', async () => {
      // RED
      await expect(
        DayTagService.createTag({ displayName: '' })
      ).rejects.toThrow('Tag cannot be empty');
    });
  });
});
```

**Run Tests** (they should FAIL):
```bash
npm test -- dayTagService.test.ts
```

#### Step 2.2: Implement Tag CRUD Methods (1.5 hours)

**TDD Cycle**: For each method, write test first (RED), then implement (GREEN), then refactor.

```typescript
// src/services/dayTagService.ts
import { db, dayTags, dayTagAssociations } from '../db/client';
import { eq, and, inArray, desc, asc } from 'drizzle-orm';
import type { DayTag, CreateTagInput, ValidationResult } from '../types/dayTag';
import { TAG_VALIDATION } from '../types/dayTag';

export class DayTagService {

  // Utility: Normalize tag name
  static normalizeTagName(displayName: string): string {
    return displayName.trim().toLowerCase();
  }

  // Utility: Validate tag name
  static validateTagName(displayName: string): ValidationResult {
    const errors = [];

    if (displayName.trim().length < TAG_VALIDATION.MIN_LENGTH) {
      errors.push({ field: 'displayName', message: 'Tag cannot be empty' });
    }

    if (displayName.length > TAG_VALIDATION.MAX_LENGTH) {
      errors.push({
        field: 'displayName',
        message: `Tag must be ${TAG_VALIDATION.MAX_LENGTH} characters or less`
      });
    }

    if (!TAG_VALIDATION.ALLOWED_PATTERN.test(displayName)) {
      errors.push({
        field: 'displayName',
        message: 'Tag can only contain letters, numbers, spaces, hyphens, and underscores'
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Create tag (or return existing)
  static async createTag(input: CreateTagInput): Promise<DayTag> {
    const validation = this.validateTagName(input.displayName);
    if (!validation.isValid) {
      throw new Error(validation.errors[0].message);
    }

    const normalized = this.normalizeTagName(input.displayName);

    // Check if exists
    const existing = await db
      .select()
      .from(dayTags)
      .where(eq(dayTags.name, normalized))
      .get();

    if (existing) {
      return existing;
    }

    // Create new
    const [newTag] = await db
      .insert(dayTags)
      .values({
        name: normalized,
        displayName: input.displayName,
        usageCount: 0,
      })
      .returning();

    return newTag;
  }

  // Get all tags
  static async getAllTags(): Promise<DayTag[]> {
    return db
      .select()
      .from(dayTags)
      .orderBy(desc(dayTags.usageCount), asc(dayTags.displayName));
  }

  // Get tags for date
  static async getTagsForDate(date: string): Promise<DayTag[]> {
    return db
      .select({
        id: dayTags.id,
        name: dayTags.name,
        displayName: dayTags.displayName,
        createdAt: dayTags.createdAt,
        usageCount: dayTags.usageCount,
      })
      .from(dayTags)
      .innerJoin(dayTagAssociations, eq(dayTagAssociations.tagId, dayTags.id))
      .where(eq(dayTagAssociations.date, date))
      .orderBy(asc(dayTags.displayName));
  }

  // Add tag to day
  static async addTagToDay(tagId: number, date: string): Promise<DayTagAssociation> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Check max tags
    const existingTags = await this.getTagsForDate(date);
    if (existingTags.length >= TAG_VALIDATION.MAX_TAGS_PER_DAY) {
      throw new Error(`Maximum ${TAG_VALIDATION.MAX_TAGS_PER_DAY} tags per day`);
    }

    // Create association
    const [association] = await db
      .insert(dayTagAssociations)
      .values({ tagId, date })
      .returning();

    // Increment usage count
    await db
      .update(dayTags)
      .set({ usageCount: sql`${dayTags.usageCount} + 1` })
      .where(eq(dayTags.id, tagId));

    return association;
  }

  // Remove tag from day
  static async removeTagFromDay(tagId: number, date: string): Promise<void> {
    await db
      .delete(dayTagAssociations)
      .where(
        and(
          eq(dayTagAssociations.tagId, tagId),
          eq(dayTagAssociations.date, date)
        )
      );

    // Decrement usage count
    await db
      .update(dayTags)
      .set({ usageCount: sql`${dayTags.usageCount} - 1` })
      .where(eq(dayTags.id, tagId));
  }
}
```

**Run Tests** (they should PASS):
```bash
npm test -- dayTagService.test.ts
```

**Checkpoint**: All service tests passing, 90%+ coverage.

#### Step 2.3: Implement Filtering Methods (1 hour)

Write tests first for:
- `getEntriesByTag(tagName, startDate, endDate)`
- `getEntriesByTags(filter, startDate, endDate)`
- `getTaggedDatesInMonth(year, month)`

Then implement following the same TDD cycle.

**Run Tests**:
```bash
npm test -- dayTagService.test.ts
```

---

### Phase 3: State Management (Zustand Store) - ~2 hours

**Goal**: Implement DayTagStore with TDD.

#### Step 3.1: Create Store & Tests (20 min)

```bash
touch src/stores/dayTagStore.ts
touch __tests__/stores/dayTagStore.test.ts
```

#### Step 3.2: Implement Store (1.5 hours)

```typescript
// src/stores/dayTagStore.ts
import { create } from 'zustand';
import { DayTagService } from '../services/dayTagService';
import type { DayTag, TagFilter } from '../types/dayTag';
import type { CombinedEntry } from '../types/entry';

interface DayTagState {
  // Data
  allTags: DayTag[];
  tagsForDate: Record<string, string[]>;
  taggedDatesInMonth: Record<string, string[]>;
  currentFilter: TagFilter | null;
  filteredEntries: CombinedEntry[] | null;

  // Loading
  isLoadingTags: boolean;
  isCreatingTag: boolean;
  isUpdatingAssociation: boolean;
  error: string | null;

  // Actions
  loadAllTags: () => Promise<void>;
  loadTagsForDate: (date: string) => Promise<string[]>;
  createTag: (displayName: string) => Promise<DayTag>;
  addTagToDay: (date: string, tagName: string) => Promise<void>;
  removeTagFromDay: (date: string, tagName: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDayTagStore = create<DayTagState>((set, get) => ({
  // Initial state
  allTags: [],
  tagsForDate: {},
  taggedDatesInMonth: {},
  currentFilter: null,
  filteredEntries: null,
  isLoadingTags: false,
  isCreatingTag: false,
  isUpdatingAssociation: false,
  error: null,

  // Load all tags
  loadAllTags: async () => {
    set({ isLoadingTags: true, error: null });
    try {
      const tags = await DayTagService.getAllTags();
      set({ allTags: tags });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoadingTags: false });
    }
  },

  // Load tags for date
  loadTagsForDate: async (date: string) => {
    try {
      const tags = await DayTagService.getTagsForDate(date);
      const tagNames = tags.map(t => t.displayName);
      set(state => ({
        tagsForDate: { ...state.tagsForDate, [date]: tagNames }
      }));
      return tagNames;
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },

  // Create tag
  createTag: async (displayName: string) => {
    set({ isCreatingTag: true, error: null });
    try {
      const tag = await DayTagService.createTag({ displayName });
      set(state => ({
        allTags: [...state.allTags, tag].sort((a, b) => b.usageCount - a.usageCount)
      }));
      return tag;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isCreatingTag: false });
    }
  },

  // Add tag to day
  addTagToDay: async (date: string, tagName: string) => {
    set({ isUpdatingAssociation: true, error: null });
    try {
      const tag = await get().createTag(tagName);  // Create or get existing
      await DayTagService.addTagToDay(tag.id, date);

      // Update state
      set(state => ({
        tagsForDate: {
          ...state.tagsForDate,
          [date]: [...(state.tagsForDate[date] || []), tag.displayName]
        }
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isUpdatingAssociation: false });
    }
  },

  // Remove tag from day
  removeTagFromDay: async (date: string, tagName: string) => {
    set({ isUpdatingAssociation: true, error: null });
    try {
      const tag = get().allTags.find(
        t => t.displayName.toLowerCase() === tagName.toLowerCase()
      );
      if (!tag) throw new Error('Tag not found');

      await DayTagService.removeTagFromDay(tag.id, date);

      // Update state
      set(state => ({
        tagsForDate: {
          ...state.tagsForDate,
          [date]: (state.tagsForDate[date] || []).filter(t => t !== tagName)
        }
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isUpdatingAssociation: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset
  reset: () => set({
    allTags: [],
    tagsForDate: {},
    taggedDatesInMonth: {},
    currentFilter: null,
    filteredEntries: null,
    error: null,
  }),
}));
```

**Test**:
```bash
npm test -- dayTagStore.test.ts
```

---

### Phase 4: UI Components - ~3 hours

**Goal**: Build UI components with TDD.

#### Step 4.1: DayTagBadge Component (30 min)

```bash
mkdir -p src/components/DayTags
touch src/components/DayTags/DayTagBadge.tsx
touch __tests__/components/DayTags/DayTagBadge.test.tsx
```

**Test First**:
```typescript
// __tests__/components/DayTags/DayTagBadge.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DayTagBadge } from '../../../src/components/DayTags/DayTagBadge';

describe('DayTagBadge', () => {
  it('renders tag name', () => {
    const { getByText } = render(<DayTagBadge tagName="Vacation" />);
    expect(getByText('Vacation')).toBeDefined();
  });

  it('uses orange theme for inherited tags', () => {
    const { getByTestId } = render(
      <DayTagBadge tagName="Vacation" isInherited testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#FFF3E0' })
    );
  });

  it('calls onPress when pressable', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <DayTagBadge tagName="Vacation" onPress={onPress} testID="badge" />
    );
    fireEvent.press(getByTestId('badge'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

**Implement**:
```typescript
// src/components/DayTags/DayTagBadge.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TAG_STYLES } from '../../types/dayTag';
import type { DayTagBadgeProps } from '../../types/dayTag';

export function DayTagBadge(props: DayTagBadgeProps) {
  const { tagName, isInherited = false, onPress, size = 'medium', testID } = props;

  const theme = isInherited ? TAG_STYLES.DAY_TAG : TAG_STYLES.ENTRY_TAG;
  const sizeStyle = TAG_STYLES.SIZES[size];

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[styles.badge, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }, sizeStyle]}
      testID={testID}
      accessibilityLabel={`${isInherited ? 'Day' : 'Entry'} tag: ${tagName}`}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <Text style={[styles.text, { color: theme.textColor, fontSize: sizeStyle.fontSize }]}>
        {tagName}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    fontWeight: '500',
  },
});
```

**Test**:
```bash
npm test -- DayTagBadge.test.tsx
```

#### Step 4.2: DayTagManager Modal (1 hour)

Follow same TDD pattern:
1. Write tests
2. Implement component
3. Verify tests pass

**Key features**:
- Modal with date header
- List of current tags (with remove buttons)
- Input for adding new tags
- Save/Cancel buttons

#### Step 4.3: DayTagPicker with Autocomplete (1 hour)

**Key features**:
- TextInput with autocomplete
- FlatList of suggestions
- Selected tags shown as badges
- Max tags validation

#### Step 4.4: Calendar Integration (30 min)

Modify `CalendarComponent.tsx` to show tag indicators:

```typescript
// src/components/Calendar/CalendarComponent.tsx
const { taggedDatesInMonth, loadTaggedDatesInMonth } = useDayTagStore();

useEffect(() => {
  loadTaggedDatesInMonth(currentYear, currentMonth);
}, [currentYear, currentMonth]);

const markedDates = {
  ...existingMarkedDates,
  ...Object.entries(taggedDatesInMonth).reduce((acc, [date, tags]) => {
    acc[date] = {
      ...acc[date],
      marked: true,
      dots: [
        ...(acc[date]?.dots || []),
        { key: 'tag', color: '#FF9500' }
      ]
    };
    return acc;
  }, {})
};
```

---

### Phase 5: Integration & Testing - ~2 hours

**Goal**: Wire everything together and test end-to-end.

#### Step 5.1: Update Calendar Screen (30 min)

```typescript
// app/(tabs)/calendar.tsx
// Add button to open DayTagManager when date is selected
const [modalVisible, setModalVisible] = useState(false);

return (
  <>
    <CalendarComponent
      onDateSelect={(date) => {
        setSelectedDate(date);
        setModalVisible(true);  // Open tag manager
      }}
    />

    <DayTagManager
      date={selectedDate}
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
    />
  </>
);
```

#### Step 5.2: Update Timeline Screen (30 min)

Add filter UI:

```typescript
// app/(tabs)/timeline.tsx
const { currentFilter, applyFilter, clearFilter } = useDayTagStore();

// Add DayTagFilter component above timeline
<DayTagFilter
  currentFilter={currentFilter}
  onFilterChange={(filter) => {
    if (filter) {
      applyFilter(filter, startDate, endDate);
    } else {
      clearFilter();
    }
  }}
  availableTags={allTags}
/>
```

#### Step 5.3: Update Export Service (30 min)

Extend export to include day tags:

```typescript
// src/services/exportService.ts
// Modify CSV headers and row generation to include dayTags column
// Modify TXT format to show day tags in date section
```

#### Step 5.4: End-to-End Testing (30 min)

**Manual Test Flow**:
1. Open calendar
2. Select today
3. Add tag "Test"
4. Verify tag appears on calendar day
5. Create entry today
6. View entry, verify it shows inherited "Test" tag
7. Filter timeline by "Test" tag
8. Export filtered data
9. Verify export includes day tags

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All unit tests passing (90%+ coverage)
- [ ] All integration tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Calendar shows tagged days
- [ ] Can add/remove tags from days
- [ ] Entries inherit day tags
- [ ] Can filter by tags
- [ ] Export includes day tags
- [ ] Performance: Tag operations <2s
- [ ] Performance: Filtering 1000 entries <3s
- [ ] Accessibility: Screen reader works
- [ ] No memory leaks (check with React DevTools Profiler)

## Common Issues & Solutions

### Issue: Migration doesn't apply
**Solution**: Delete and reinstall app to force migration

### Issue: Tags not showing on calendar
**Solution**: Check `loadTaggedDatesInMonth` is called when month changes

### Issue: Filter not working
**Solution**: Verify tag name normalization matches (lowercase)

### Issue: Tests failing
**Solution**: Clear database in `beforeEach` hooks

## Next Steps

After implementation complete:

1. Create pull request
2. Code review
3. QA testing
4. Merge to main
5. Deploy

## Resources

- **Spec**: `specs/002-day-tags/spec.md`
- **Research**: `specs/002-day-tags/research.md`
- **Data Model**: `specs/002-day-tags/data-model.md`
- **Contracts**: `specs/002-day-tags/contracts/`
- **Drizzle Docs**: https://orm.drizzle.team/
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **React Native Testing Library**: https://callstack.github.io/react-native-testing-library/
