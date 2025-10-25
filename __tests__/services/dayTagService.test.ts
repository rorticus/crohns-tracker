/**
 * Day Tag Service Tests
 *
 * Test-Driven Development (TDD) approach:
 * 1. Write these tests FIRST
 * 2. Run tests - they should FAIL (RED phase)
 * 3. Implement service methods to make tests PASS (GREEN phase)
 * 4. Refactor code while keeping tests passing (REFACTOR phase)
 */

import * as DayTagService from '../../src/services/dayTagService';
import db, { dayTags, dayTagAssociations } from '../../src/db/client';
import { eq, and } from 'drizzle-orm';
import {
  TagValidationError,
  MaxTagsExceededError,
  DuplicateAssociationError,
} from '../../src/types/dayTag';

describe('DayTagService', () => {
  // Clear database before each test
  beforeEach(async () => {
    await db.delete(dayTagAssociations);
    await db.delete(dayTags);
  });

  // T011: Write test: createTag() creates tag with normalized name
  describe('createTag', () => {
    it('creates a new tag with normalized name', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });

      expect(tag).toBeDefined();
      expect(tag.id).toBeGreaterThan(0);
      expect(tag.name).toBe('vacation'); // Normalized lowercase
      expect(tag.displayName).toBe('Vacation'); // Preserved
      expect(tag.usageCount).toBe(0);
      expect(tag.createdAt).toBeDefined();
    });

    // T012: Write test: createTag() reuses existing tag if name matches
    it('reuses existing tag if normalized name matches', async () => {
      const tag1 = await DayTagService.createTag({ displayName: 'Vacation' });
      const tag2 = await DayTagService.createTag({ displayName: 'VACATION' });
      const tag3 = await DayTagService.createTag({ displayName: 'vacation' });

      expect(tag1.id).toBe(tag2.id);
      expect(tag2.id).toBe(tag3.id);
      expect(tag1.displayName).toBe('Vacation'); // Original preserved
      expect(tag2.displayName).toBe('Vacation'); // Returns original
      expect(tag3.displayName).toBe('Vacation'); // Returns original
    });

    // T013: Write test: createTag() validates tag length (1-50 chars)
    it('validates tag length - minimum 1 character', async () => {
      await expect(DayTagService.createTag({ displayName: '' })).rejects.toThrow(
        TagValidationError
      );
      await expect(DayTagService.createTag({ displayName: '   ' })).rejects.toThrow(
        TagValidationError
      );
    });

    it('validates tag length - maximum 50 characters', async () => {
      const longTag = 'a'.repeat(51);
      await expect(DayTagService.createTag({ displayName: longTag })).rejects.toThrow(
        TagValidationError
      );
    });

    // T014: Write test: createTag() validates allowed characters
    it('validates allowed characters - alphanumeric, spaces, hyphens, underscores', async () => {
      // Valid characters
      const validTag = await DayTagService.createTag({ displayName: 'Valid-Tag_123 Name' });
      expect(validTag).toBeDefined();

      // Invalid characters
      await expect(DayTagService.createTag({ displayName: 'Tag<with>brackets' })).rejects.toThrow(
        TagValidationError
      );
      await expect(
        DayTagService.createTag({ displayName: 'Tag{with}braces' })
      ).rejects.toThrow(TagValidationError);
      await expect(
        DayTagService.createTag({ displayName: 'Tag/with/slashes' })
      ).rejects.toThrow(TagValidationError);
    });
  });

  // T015: Write test: getAllTags() returns tags sorted by usage
  describe('getAllTags', () => {
    it('returns all tags sorted by usage count descending, then alphabetically', async () => {
      // Create tags with different usage counts
      const tag1 = await DayTagService.createTag({ displayName: 'Zebra' });
      const tag2 = await DayTagService.createTag({ displayName: 'Alpha' });
      const tag3 = await DayTagService.createTag({ displayName: 'Beta' });

      // Manually update usage counts
      await db
        .update(dayTags)
        .set({ usageCount: 5 })
        .where(eq(dayTags.id, tag1.id));
      await db
        .update(dayTags)
        .set({ usageCount: 10 })
        .where(eq(dayTags.id, tag2.id));
      await db
        .update(dayTags)
        .set({ usageCount: 10 })
        .where(eq(dayTags.id, tag3.id));

      const tags = await DayTagService.getAllTags();

      expect(tags).toHaveLength(3);
      // Alpha and Beta both have 10, but Alpha comes first alphabetically
      expect(tags[0].displayName).toBe('Alpha');
      expect(tags[1].displayName).toBe('Beta');
      expect(tags[2].displayName).toBe('Zebra');
    });

    it('returns empty array when no tags exist', async () => {
      const tags = await DayTagService.getAllTags();
      expect(tags).toEqual([]);
    });
  });

  // T016: Write test: getTagsForDate() returns tags for specific date
  describe('getTagsForDate', () => {
    it('returns all tags for a specific date', async () => {
      const tag1 = await DayTagService.createTag({ displayName: 'Vacation' });
      const tag2 = await DayTagService.createTag({ displayName: 'Medicine' });
      const tag3 = await DayTagService.createTag({ displayName: 'Other' });

      const date = '2025-10-25';

      // Add tags to date
      await db.insert(dayTagAssociations).values({ tagId: tag1.id, date });
      await db.insert(dayTagAssociations).values({ tagId: tag2.id, date });

      const tags = await DayTagService.getTagsForDate(date);

      expect(tags).toHaveLength(2);
      expect(tags.map((t) => t.displayName).sort()).toEqual(['Medicine', 'Vacation']);
    });

    it('returns empty array for date with no tags', async () => {
      const tags = await DayTagService.getTagsForDate('2025-10-25');
      expect(tags).toEqual([]);
    });
  });

  // T017: Write test: addTagToDay() creates association
  describe('addTagToDay', () => {
    it('creates association between tag and date', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });
      const date = '2025-10-25';

      const association = await DayTagService.addTagToDay(tag.id, date);

      expect(association).toBeDefined();
      expect(association.tagId).toBe(tag.id);
      expect(association.date).toBe(date);

      // Verify association exists in database
      const associations = await db
        .select()
        .from(dayTagAssociations)
        .where(
          and(eq(dayTagAssociations.tagId, tag.id), eq(dayTagAssociations.date, date))
        );
      expect(associations).toHaveLength(1);
    });

    // T018: Write test: addTagToDay() enforces max 10 tags per day
    it('enforces maximum 10 tags per day', async () => {
      const date = '2025-10-25';

      // Create and add 10 tags
      for (let i = 0; i < 10; i++) {
        const tag = await DayTagService.createTag({ displayName: `Tag${i}` });
        await DayTagService.addTagToDay(tag.id, date);
      }

      // Try to add 11th tag
      const tag11 = await DayTagService.createTag({ displayName: 'Tag11' });
      await expect(DayTagService.addTagToDay(tag11.id, date)).rejects.toThrow(
        MaxTagsExceededError
      );
    });

    // T019: Write test: addTagToDay() increments usageCount
    it('increments tag usageCount when association created', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });
      expect(tag.usageCount).toBe(0);

      await DayTagService.addTagToDay(tag.id, '2025-10-25');
      await DayTagService.addTagToDay(tag.id, '2025-10-26');

      const updatedTag = await db
        .select()
        .from(dayTags)
        .where(eq(dayTags.id, tag.id))
        .get();

      expect(updatedTag?.usageCount).toBe(2);
    });

    it('validates date format', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });

      await expect(DayTagService.addTagToDay(tag.id, 'invalid-date')).rejects.toThrow();
      await expect(DayTagService.addTagToDay(tag.id, '2025/10/25')).rejects.toThrow();
      await expect(DayTagService.addTagToDay(tag.id, '25-10-2025')).rejects.toThrow();
    });

    it('prevents duplicate associations', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });
      const date = '2025-10-25';

      await DayTagService.addTagToDay(tag.id, date);

      // Try to add same tag to same date again
      await expect(DayTagService.addTagToDay(tag.id, date)).rejects.toThrow(
        DuplicateAssociationError
      );
    });
  });

  // T020: Write test: removeTagFromDay() deletes association
  describe('removeTagFromDay', () => {
    it('removes association between tag and date', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });
      const date = '2025-10-25';

      await DayTagService.addTagToDay(tag.id, date);

      // Verify association exists
      let associations = await db
        .select()
        .from(dayTagAssociations)
        .where(
          and(eq(dayTagAssociations.tagId, tag.id), eq(dayTagAssociations.date, date))
        );
      expect(associations).toHaveLength(1);

      // Remove association
      await DayTagService.removeTagFromDay(tag.id, date);

      // Verify association removed
      associations = await db
        .select()
        .from(dayTagAssociations)
        .where(
          and(eq(dayTagAssociations.tagId, tag.id), eq(dayTagAssociations.date, date))
        );
      expect(associations).toHaveLength(0);
    });

    // T021: Write test: removeTagFromDay() decrements usageCount
    it('decrements tag usageCount when association deleted', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });

      await DayTagService.addTagToDay(tag.id, '2025-10-25');
      await DayTagService.addTagToDay(tag.id, '2025-10-26');

      let updatedTag = await db.select().from(dayTags).where(eq(dayTags.id, tag.id)).get();
      expect(updatedTag?.usageCount).toBe(2);

      await DayTagService.removeTagFromDay(tag.id, '2025-10-25');

      updatedTag = await db.select().from(dayTags).where(eq(dayTags.id, tag.id)).get();
      expect(updatedTag?.usageCount).toBe(1);
    });

    it('handles removing non-existent association gracefully', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });
      const date = '2025-10-25';

      // Should not throw error
      await expect(DayTagService.removeTagFromDay(tag.id, date)).resolves.not.toThrow();
    });
  });

  // Additional helper methods
  describe('getTagById', () => {
    it('returns tag by ID', async () => {
      const createdTag = await DayTagService.createTag({ displayName: 'Vacation' });

      const tag = await DayTagService.getTagById(createdTag.id);

      expect(tag).toBeDefined();
      expect(tag?.id).toBe(createdTag.id);
      expect(tag?.displayName).toBe('Vacation');
    });

    it('returns null for non-existent tag', async () => {
      const tag = await DayTagService.getTagById(999);
      expect(tag).toBeNull();
    });
  });

  describe('getTagByName', () => {
    it('returns tag by normalized name', async () => {
      await DayTagService.createTag({ displayName: 'Vacation' });

      const tag = await DayTagService.getTagByName('VACATION');

      expect(tag).toBeDefined();
      expect(tag?.displayName).toBe('Vacation');
    });

    it('returns null for non-existent tag', async () => {
      const tag = await DayTagService.getTagByName('NonExistent');
      expect(tag).toBeNull();
    });
  });

  describe('getDatesWithTag', () => {
    it('returns all dates that have a specific tag', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });

      await DayTagService.addTagToDay(tag.id, '2025-10-25');
      await DayTagService.addTagToDay(tag.id, '2025-10-26');
      await DayTagService.addTagToDay(tag.id, '2025-10-27');

      const dates = await DayTagService.getDatesWithTag(tag.id);

      expect(dates).toHaveLength(3);
      expect(dates.sort()).toEqual(['2025-10-25', '2025-10-26', '2025-10-27']);
    });

    it('supports date range filtering', async () => {
      const tag = await DayTagService.createTag({ displayName: 'Vacation' });

      await DayTagService.addTagToDay(tag.id, '2025-10-24');
      await DayTagService.addTagToDay(tag.id, '2025-10-25');
      await DayTagService.addTagToDay(tag.id, '2025-10-26');
      await DayTagService.addTagToDay(tag.id, '2025-10-27');

      const dates = await DayTagService.getDatesWithTag(
        tag.id,
        '2025-10-25',
        '2025-10-26'
      );

      expect(dates).toHaveLength(2);
      expect(dates.sort()).toEqual(['2025-10-25', '2025-10-26']);
    });
  });

  describe('getTaggedDatesInMonth', () => {
    it('returns all tagged dates in a specific month', async () => {
      const tag1 = await DayTagService.createTag({ displayName: 'Vacation' });
      const tag2 = await DayTagService.createTag({ displayName: 'Medicine' });

      // Add tags to various dates in October
      await DayTagService.addTagToDay(tag1.id, '2025-10-25');
      await DayTagService.addTagToDay(tag2.id, '2025-10-25');
      await DayTagService.addTagToDay(tag1.id, '2025-10-26');

      // Add tag to different month (should be excluded)
      await DayTagService.addTagToDay(tag1.id, '2025-11-01');

      const taggedDates = await DayTagService.getTaggedDatesInMonth(2025, 10);

      expect(Object.keys(taggedDates)).toHaveLength(2);
      expect(taggedDates['2025-10-25']).toHaveLength(2);
      expect(taggedDates['2025-10-26']).toHaveLength(1);
      expect(taggedDates['2025-10-25'].sort()).toEqual(['Medicine', 'Vacation']);
    });

    it('returns empty object for month with no tagged dates', async () => {
      const taggedDates = await DayTagService.getTaggedDatesInMonth(2025, 10);
      expect(taggedDates).toEqual({});
    });
  });

  // Cleanup
  afterAll(async () => {
    await db.delete(dayTagAssociations);
    await db.delete(dayTags);
  });
});
