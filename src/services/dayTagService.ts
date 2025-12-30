/**
 * Day Tag Service
 *
 * Business logic for day tag operations including CRUD, associations,
 * filtering, and validation. All functions are exported for stateless operation.
 *
 * Contract: specs/002-day-tags/contracts/DayTagService.contract.ts
 * Tests: __tests__/services/dayTagService.test.ts
 */

import db, { dayTags, dayTagAssociations, entries, bowelMovements, notes } from '../db/client';
import { eq, and, inArray, desc, asc, gte, lte, sql } from 'drizzle-orm';
import { normalizeTagName as normalize, validateTagName as validate } from '../utils/tagUtils';
import {
  type DayTag,
  type DayTagAssociation,
  type CreateTagInput,
  type TagFilter,
  type ValidationResult,
  TagValidationError,
  TagNotFoundError,
  DuplicateAssociationError,
  MaxTagsExceededError,
  TAG_VALIDATION,
} from '../types/dayTag';

// ============================================================================
// Tag Management
// ============================================================================

/**
 * Create a new tag or return existing tag with same normalized name
 */
export async function createTag(input: CreateTagInput): Promise<DayTag> {
  // Validate tag name
  const validation = validate(input.displayName);
  if (!validation.isValid) {
    throw new TagValidationError(validation.errors);
  }

  const normalized = normalize(input.displayName);

  // Check if tag with normalized name already exists
  const existing = await db
    .select()
    .from(dayTags)
    .where(eq(dayTags.name, normalized))
    .get();

  if (existing) {
    // If existing tag has no description but new input has one, update it
    if (!existing.description && input.description) {
      const [updated] = await db
        .update(dayTags)
        .set({ description: input.description })
        .where(eq(dayTags.id, existing.id))
        .returning();
      return updated;
    }
    return existing;
  }

  // Create new tag
  const [newTag] = await db
    .insert(dayTags)
    .values({
      name: normalized,
      displayName: input.displayName,
      description: input.description,
      usageCount: 0,
    })
    .returning();

  return newTag;
}

/**
 * Update a tag's description
 */
export async function updateTagDescription(tagId: number, description: string | null): Promise<DayTag> {
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new TagNotFoundError(tagId);
  }

  const [updated] = await db
    .update(dayTags)
    .set({ description })
    .where(eq(dayTags.id, tagId))
    .returning();

  return updated;
}

/**
 * Get all unique tags ordered by usage and name
 */
export async function getAllTags(): Promise<DayTag[]> {
  return db
    .select()
    .from(dayTags)
    .orderBy(desc(dayTags.usageCount), asc(dayTags.displayName));
}

/**
 * Get a specific tag by ID
 */
export async function getTagById(tagId: number): Promise<DayTag | null> {
  const tag = await db.select().from(dayTags).where(eq(dayTags.id, tagId)).get();
  return tag || null;
}

/**
 * Get a specific tag by normalized name
 */
export async function getTagByName(tagName: string): Promise<DayTag | null> {
  const normalized = normalize(tagName);
  const tag = await db.select().from(dayTags).where(eq(dayTags.name, normalized)).get();
  return tag || null;
}

/**
 * Delete a tag by ID
 *
 * Cascade deletes all associations (handled by database FK constraint)
 */
export async function deleteTag(tagId: number): Promise<void> {
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new TagNotFoundError(tagId);
  }

  await db.delete(dayTags).where(eq(dayTags.id, tagId));
}

// ============================================================================
// Tag-Date Associations
// ============================================================================

/**
 * Add a tag to a specific date (create association)
 */
export async function addTagToDay(tagId: number, date: string): Promise<DayTagAssociation> {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  // Verify tag exists
  const tag = await getTagById(tagId);
  if (!tag) {
    throw new TagNotFoundError(tagId);
  }

  // Check if association already exists
  const existingAssociation = await db
    .select()
    .from(dayTagAssociations)
    .where(and(eq(dayTagAssociations.tagId, tagId), eq(dayTagAssociations.date, date)))
    .get();

  if (existingAssociation) {
    throw new DuplicateAssociationError(tag.displayName, date);
  }

  // Check max tags per day limit
  const existingTags = await getTagsForDate(date);
  if (existingTags.length >= TAG_VALIDATION.MAX_TAGS_PER_DAY) {
    throw new MaxTagsExceededError(date, TAG_VALIDATION.MAX_TAGS_PER_DAY);
  }

  // Create association and increment usage count in a transaction
  const [association] = await db.transaction(async (tx) => {
    // Create association
    const [newAssoc] = await tx
      .insert(dayTagAssociations)
      .values({ tagId, date })
      .returning();

    // Increment usage count
    await tx
      .update(dayTags)
      .set({ usageCount: sql`${dayTags.usageCount} + 1` })
      .where(eq(dayTags.id, tagId));

    return [newAssoc];
  });

  return association;
}

/**
 * Remove a tag from a specific date (delete association)
 */
export async function removeTagFromDay(tagId: number, date: string): Promise<void> {
  // Delete association and decrement usage count in a transaction
  await db.transaction(async (tx) => {
    // Delete association
    await tx
      .delete(dayTagAssociations)
      .where(and(eq(dayTagAssociations.tagId, tagId), eq(dayTagAssociations.date, date)));

    // Decrement usage count (only if > 0)
    await tx
      .update(dayTags)
      .set({ usageCount: sql`MAX(0, ${dayTags.usageCount} - 1)` })
      .where(eq(dayTags.id, tagId));
  });
}

/**
 * Get all tags associated with a specific date
 */
export async function getTagsForDate(date: string): Promise<DayTag[]> {
  const tags = await db
    .select({
      id: dayTags.id,
      name: dayTags.name,
      displayName: dayTags.displayName,
      description: dayTags.description,
      createdAt: dayTags.createdAt,
      usageCount: dayTags.usageCount,
    })
    .from(dayTags)
    .innerJoin(dayTagAssociations, eq(dayTagAssociations.tagId, dayTags.id))
    .where(eq(dayTagAssociations.date, date))
    .orderBy(asc(dayTags.displayName));

  return tags;
}

/**
 * Get all dates that have a specific tag (within optional date range)
 */
export async function getDatesWithTag(
  tagId: number,
  startDate?: string,
  endDate?: string
): Promise<string[]> {
  // Build conditions array
  const conditions = [eq(dayTagAssociations.tagId, tagId)];
  if (startDate) {
    conditions.push(gte(dayTagAssociations.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(dayTagAssociations.date, endDate));
  }

  const results = await db
    .select({ date: dayTagAssociations.date })
    .from(dayTagAssociations)
    .where(and(...conditions))
    .orderBy(asc(dayTagAssociations.date));

  return results.map((r) => r.date);
}

/**
 * Get tagged dates for a calendar month (for rendering)
 */
export async function getTaggedDatesInMonth(
  year: number,
  month: number
): Promise<Record<string, string[]>> {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

  const results = await db
    .select({
      date: dayTagAssociations.date,
      tagName: dayTags.displayName,
    })
    .from(dayTagAssociations)
    .innerJoin(dayTags, eq(dayTagAssociations.tagId, dayTags.id))
    .where(and(gte(dayTagAssociations.date, startDate), lte(dayTagAssociations.date, endDate)))
    .orderBy(asc(dayTagAssociations.date));

  // Group by date
  const taggedDates: Record<string, string[]> = {};
  for (const row of results) {
    if (!taggedDates[row.date]) {
      taggedDates[row.date] = [];
    }
    taggedDates[row.date].push(row.tagName);
  }

  return taggedDates;
}

// ============================================================================
// Entry Filtering by Tags
// ============================================================================

/**
 * Get all entries that have a specific day tag (single tag filter)
 */
export async function getEntriesByTag(
  tagName: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const normalized = normalize(tagName);

  // Find tag
  const tag = await db.select().from(dayTags).where(eq(dayTags.name, normalized)).get();

  if (!tag) {
    throw new TagNotFoundError(-1); // Tag doesn't exist
  }

  // Get all dates with this tag in range
  const datesWithTag = await getDatesWithTag(tag.id, startDate, endDate);

  if (datesWithTag.length === 0) {
    return [];
  }

  // Get entries for those dates with joined data (same pattern as getEntriesForDateRange)
  const result = await db
    .select({
      entry: entries,
      bowelMovement: bowelMovements,
      note: notes,
    })
    .from(entries)
    .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
    .leftJoin(notes, eq(entries.id, notes.entryId))
    .where(
      and(
        inArray(entries.date, datesWithTag),
        gte(entries.date, startDate),
        lte(entries.date, endDate)
      )
    )
    .orderBy(desc(entries.timestamp));

  // Transform to CombinedEntry format
  const entriesWithTag = result.map((row) => {
    const baseEntry = {
      id: row.entry.id,
      type: row.entry.type,
      date: row.entry.date,
      time: row.entry.time,
      timestamp: row.entry.timestamp,
      createdAt: row.entry.createdAt,
      updatedAt: row.entry.updatedAt,
    };

    if (row.entry.type === 'bowel_movement' && row.bowelMovement) {
      return {
        ...baseEntry,
        type: 'bowel_movement' as const,
        bowelMovement: {
          consistency: row.bowelMovement.consistency,
          urgency: row.bowelMovement.urgency,
          notes: row.bowelMovement.notes || undefined,
        },
      };
    } else if (row.entry.type === 'note' && row.note) {
      return {
        ...baseEntry,
        type: 'note' as const,
        note: {
          category: row.note.category,
          content: row.note.content,
          tags: row.note.tags || undefined,
        },
      };
    }

    // Fallback for invalid entry structure
    return baseEntry;
  });

  // Attach day tags to each entry
  return attachDayTagsToEntries(entriesWithTag);
}

/**
 * Get entries filtered by multiple day tags (AND/OR logic)
 */
export async function getEntriesByTags(
  filter: TagFilter,
  startDate: string,
  endDate: string
): Promise<any[]> {
  // Normalize tag names and get tag IDs
  const tagIds: number[] = [];
  for (const tagName of filter.tags) {
    const normalized = normalize(tagName);
    const tag = await db.select().from(dayTags).where(eq(dayTags.name, normalized)).get();

    if (!tag) {
      throw new TagNotFoundError(-1); // Tag doesn't exist
    }
    tagIds.push(tag.id);
  }

  let datesWithTags: string[] = [];

  if (filter.matchMode === 'any') {
    // OR logic: dates with ANY of the specified tags
    const results = await db
      .select({ date: dayTagAssociations.date })
      .from(dayTagAssociations)
      .where(
        and(
          inArray(dayTagAssociations.tagId, tagIds),
          gte(dayTagAssociations.date, startDate),
          lte(dayTagAssociations.date, endDate)
        )
      )
      .groupBy(dayTagAssociations.date);

    datesWithTags = results.map((r) => r.date);
  } else {
    // AND logic: dates with ALL of the specified tags
    // Find dates that have all specified tags using HAVING COUNT
    const results = await db
      .select({ date: dayTagAssociations.date })
      .from(dayTagAssociations)
      .where(
        and(
          inArray(dayTagAssociations.tagId, tagIds),
          gte(dayTagAssociations.date, startDate),
          lte(dayTagAssociations.date, endDate)
        )
      )
      .groupBy(dayTagAssociations.date)
      .having(sql`COUNT(DISTINCT ${dayTagAssociations.tagId}) = ${tagIds.length}`);

    datesWithTags = results.map((r) => r.date);
  }

  if (datesWithTags.length === 0) {
    return [];
  }

  // Get entries for those dates with joined data (same pattern as getEntriesForDateRange)
  const result = await db
    .select({
      entry: entries,
      bowelMovement: bowelMovements,
      note: notes,
    })
    .from(entries)
    .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
    .leftJoin(notes, eq(entries.id, notes.entryId))
    .where(
      and(
        inArray(entries.date, datesWithTags),
        gte(entries.date, startDate),
        lte(entries.date, endDate)
      )
    )
    .orderBy(desc(entries.timestamp));

  // Transform to CombinedEntry format
  const entriesWithTags = result.map((row) => {
    const baseEntry = {
      id: row.entry.id,
      type: row.entry.type,
      date: row.entry.date,
      time: row.entry.time,
      timestamp: row.entry.timestamp,
      createdAt: row.entry.createdAt,
      updatedAt: row.entry.updatedAt,
    };

    if (row.entry.type === 'bowel_movement' && row.bowelMovement) {
      return {
        ...baseEntry,
        type: 'bowel_movement' as const,
        bowelMovement: {
          consistency: row.bowelMovement.consistency,
          urgency: row.bowelMovement.urgency,
          notes: row.bowelMovement.notes || undefined,
        },
      };
    } else if (row.entry.type === 'note' && row.note) {
      return {
        ...baseEntry,
        type: 'note' as const,
        note: {
          category: row.note.category,
          content: row.note.content,
          tags: row.note.tags || undefined,
        },
      };
    }

    // Fallback for invalid entry structure
    return baseEntry;
  });

  // Attach day tags to each entry
  return attachDayTagsToEntries(entriesWithTags);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Attach day tags to entries (computed at query time)
 *
 * Internal helper function for adding dayTags property to entries.
 */
async function attachDayTagsToEntries(entries: any[]): Promise<any[]> {
  if (entries.length === 0) {
    return [];
  }

  // Get unique dates from entries
  const uniqueDates = [...new Set(entries.map((e) => e.date))];

  // Get tags for all dates in batch
  const dateTagsMap: Record<string, DayTag[]> = {};
  for (const date of uniqueDates) {
    dateTagsMap[date] = await getTagsForDate(date);
  }

  // Attach day tags to each entry
  return entries.map((entry) => ({
    ...entry,
    dayTags: dateTagsMap[entry.date] || [],
  }));
}

/**
 * Normalize a tag name for matching
 *
 * Public wrapper for utility function (for contract compliance)
 */
export function normalizeTagName(displayName: string): string {
  return normalize(displayName);
}

/**
 * Validate a tag name
 *
 * Public wrapper for utility function (for contract compliance)
 */
export function validateTagName(displayName: string): ValidationResult {
  return validate(displayName);
}
