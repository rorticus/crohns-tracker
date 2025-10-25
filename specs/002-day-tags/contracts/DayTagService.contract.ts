/**
 * Day Tag Service Contract
 *
 * Defines the interface for all day tag business logic operations.
 * This contract specifies method signatures, input/output types, error conditions,
 * and business rules for the DayTagService implementation.
 *
 * Implementation: src/services/dayTagService.ts
 * Tests: __tests__/services/dayTagService.test.ts
 */

import type { DayTag, DayTagAssociation, CreateTagInput, TagFilter } from '../types/dayTag';
import type { CombinedEntry } from '../types/entry';

/**
 * Day Tag Service Interface
 *
 * Static service class following existing pattern (EntryService, ExportService).
 * All methods are static and return Promises for async operations.
 */
export interface IDayTagService {

  // ============================================================================
  // Tag Management
  // ============================================================================

  /**
   * Create a new tag or return existing tag with same normalized name
   *
   * @param input - Tag creation input with displayName
   * @returns Promise<DayTag> - Created or existing tag
   * @throws ValidationError if displayName is invalid
   *
   * Business Rules:
   * - Normalizes displayName to lowercase for name field
   * - If normalized name exists, returns existing tag (reuse)
   * - Validates displayName: 1-50 chars, alphanumeric + spaces/hyphens/underscores
   * - Initializes usageCount to 0
   *
   * Example:
   * ```typescript
   * const tag = await DayTagService.createTag({ displayName: 'Vacation' });
   * // Returns: { id: 1, name: 'vacation', displayName: 'Vacation', createdAt: '...', usageCount: 0 }
   *
   * // Reuse example
   * const tag2 = await DayTagService.createTag({ displayName: 'VACATION' });
   * // Returns same tag: { id: 1, name: 'vacation', displayName: 'Vacation', ... }
   * ```
   */
  createTag(input: CreateTagInput): Promise<DayTag>;

  /**
   * Get all unique tags ordered by usage and name
   *
   * @returns Promise<DayTag[]> - All tags sorted by usageCount DESC, displayName ASC
   *
   * Business Rules:
   * - Returns all tags regardless of usageCount (includes inactive tags)
   * - Ordered by popularity (usageCount) then alphabetically (displayName)
   * - Used for autocomplete/suggestions
   *
   * Example:
   * ```typescript
   * const tags = await DayTagService.getAllTags();
   * // Returns: [
   * //   { id: 2, name: 'vacation', displayName: 'Vacation', usageCount: 15 },
   * //   { id: 1, name: 'new medicine', displayName: 'New Medicine', usageCount: 8 },
   * //   { id: 3, name: 'high stress', displayName: 'High Stress', usageCount: 0 }
   * // ]
   * ```
   */
  getAllTags(): Promise<DayTag[]>;

  /**
   * Get a specific tag by ID
   *
   * @param tagId - Tag ID to fetch
   * @returns Promise<DayTag | null> - Tag or null if not found
   *
   * Example:
   * ```typescript
   * const tag = await DayTagService.getTagById(1);
   * // Returns: { id: 1, name: 'vacation', displayName: 'Vacation', ... } or null
   * ```
   */
  getTagById(tagId: number): Promise<DayTag | null>;

  /**
   * Delete a tag by ID
   *
   * @param tagId - Tag ID to delete
   * @returns Promise<void>
   * @throws NotFoundError if tag doesn't exist
   *
   * Business Rules:
   * - Cascade deletes all dayTagAssociations for this tag
   * - No confirmation needed at service level (handled in UI)
   * - Can delete tags with usageCount > 0
   *
   * Example:
   * ```typescript
   * await DayTagService.deleteTag(1);
   * // Tag and all its associations are deleted
   * ```
   */
  deleteTag(tagId: number): Promise<void>;

  // ============================================================================
  // Tag-Date Associations
  // ============================================================================

  /**
   * Add a tag to a specific date (create association)
   *
   * @param tagId - Tag ID to associate
   * @param date - Date in YYYY-MM-DD format
   * @returns Promise<DayTagAssociation> - Created association
   * @throws ValidationError if date is invalid or tag doesn't exist
   * @throws ConflictError if association already exists
   * @throws BusinessRuleError if date already has 10 tags (max limit)
   *
   * Business Rules:
   * - Validates date format and constraints (no future dates)
   * - Checks for duplicate association (unique constraint)
   * - Enforces max 10 tags per day
   * - Increments tag's usageCount
   * - Applies retroactively to all entries on that date (computed at query time)
   *
   * Example:
   * ```typescript
   * const assoc = await DayTagService.addTagToDay(1, '2025-10-25');
   * // Returns: { id: 1, tagId: 1, date: '2025-10-25', createdAt: '...' }
   * // All entries on 2025-10-25 now inherit this tag
   * ```
   */
  addTagToDay(tagId: number, date: string): Promise<DayTagAssociation>;

  /**
   * Remove a tag from a specific date (delete association)
   *
   * @param tagId - Tag ID to remove
   * @param date - Date in YYYY-MM-DD format
   * @returns Promise<void>
   * @throws NotFoundError if association doesn't exist
   *
   * Business Rules:
   * - Hard deletes the association
   * - Decrements tag's usageCount
   * - Immediately removes tag from all entries on that date (computed)
   *
   * Example:
   * ```typescript
   * await DayTagService.removeTagFromDay(1, '2025-10-25');
   * // Association deleted, entries on 2025-10-25 no longer show this tag
   * ```
   */
  removeTagFromDay(tagId: number, date: string): Promise<void>;

  /**
   * Get all tags associated with a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns Promise<DayTag[]> - Tags for this date, ordered by displayName
   *
   * Business Rules:
   * - Returns empty array if date has no tags
   * - Ordered alphabetically by displayName
   *
   * Example:
   * ```typescript
   * const tags = await DayTagService.getTagsForDate('2025-10-25');
   * // Returns: [
   * //   { id: 2, name: 'new medicine', displayName: 'New Medicine', ... },
   * //   { id: 1, name: 'vacation', displayName: 'Vacation', ... }
   * // ]
   * ```
   */
  getTagsForDate(date: string): Promise<DayTag[]>;

  /**
   * Get all dates that have a specific tag (within date range)
   *
   * @param tagId - Tag ID to search for
   * @param startDate - Range start (YYYY-MM-DD), optional
   * @param endDate - Range end (YYYY-MM-DD), optional
   * @returns Promise<string[]> - Array of dates with this tag
   *
   * Business Rules:
   * - Returns dates in YYYY-MM-DD format
   * - Ordered chronologically (oldest first)
   * - If no date range provided, returns all dates with this tag
   *
   * Example:
   * ```typescript
   * const dates = await DayTagService.getDatesWithTag(1, '2025-10-01', '2025-10-31');
   * // Returns: ['2025-10-15', '2025-10-25', '2025-10-26', '2025-10-27']
   * ```
   */
  getDatesWithTag(tagId: number, startDate?: string, endDate?: string): Promise<string[]>;

  /**
   * Get tagged dates for a calendar month (for rendering)
   *
   * @param year - Year (e.g., 2025)
   * @param month - Month (1-12)
   * @returns Promise<Record<string, string[]>> - Map of date -> tag displayNames
   *
   * Business Rules:
   * - Returns only dates that have tags in the specified month
   * - Tag names are displayName (original capitalization)
   * - Used for calendar rendering (marking tagged days)
   *
   * Example:
   * ```typescript
   * const taggedDates = await DayTagService.getTaggedDatesInMonth(2025, 10);
   * // Returns: {
   * //   '2025-10-25': ['Vacation', 'New Medicine'],
   * //   '2025-10-26': ['Vacation'],
   * //   '2025-10-27': ['Vacation']
   * // }
   * ```
   */
  getTaggedDatesInMonth(year: number, month: number): Promise<Record<string, string[]>>;

  // ============================================================================
  // Entry Filtering by Tags
  // ============================================================================

  /**
   * Get all entries that have a specific day tag (single tag filter)
   *
   * @param tagName - Tag name (normalized automatically)
   * @param startDate - Range start (YYYY-MM-DD)
   * @param endDate - Range end (YYYY-MM-DD)
   * @returns Promise<CombinedEntry[]> - Entries with day tags attached
   * @throws NotFoundError if tag doesn't exist
   *
   * Business Rules:
   * - Normalizes tagName for matching
   * - Returns entries from dates that have this tag
   * - Each entry includes dayTags array (computed)
   * - Ordered by timestamp DESC (newest first)
   * - Performance target: <3s for 1000+ entries
   *
   * Example:
   * ```typescript
   * const entries = await DayTagService.getEntriesByTag('vacation', '2025-10-01', '2025-10-31');
   * // Returns all entries from days tagged with 'vacation' in October
   * // Each entry has dayTags: [{ id: 1, name: 'vacation', displayName: 'Vacation' }, ...]
   * ```
   */
  getEntriesByTag(tagName: string, startDate: string, endDate: string): Promise<CombinedEntry[]>;

  /**
   * Get entries filtered by multiple day tags (AND/OR logic)
   *
   * @param filter - Tag filter with tag names and match mode
   * @param startDate - Range start (YYYY-MM-DD)
   * @param endDate - Range end (YYYY-MM-DD)
   * @returns Promise<CombinedEntry[]> - Filtered entries with day tags
   * @throws ValidationError if any tag doesn't exist
   *
   * Business Rules:
   * - matchMode 'all' (AND): Returns entries where date has ALL specified tags
   * - matchMode 'any' (OR): Returns entries where date has ANY specified tag
   * - Normalizes all tag names for matching
   * - Each entry includes dayTags array (computed)
   * - Ordered by timestamp DESC
   *
   * Example:
   * ```typescript
   * // AND filter (date must have both tags)
   * const entries = await DayTagService.getEntriesByTags(
   *   { tags: ['vacation', 'new medicine'], matchMode: 'all' },
   *   '2025-10-01',
   *   '2025-10-31'
   * );
   * // Returns only entries from dates that have BOTH 'vacation' AND 'new medicine'
   *
   * // OR filter (date can have either tag)
   * const entries2 = await DayTagService.getEntriesByTags(
   *   { tags: ['vacation', 'high stress'], matchMode: 'any' },
   *   '2025-10-01',
   *   '2025-10-31'
   * );
   * // Returns entries from dates that have 'vacation' OR 'high stress'
   * ```
   */
  getEntriesByTags(filter: TagFilter, startDate: string, endDate: string): Promise<CombinedEntry[]>;

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Normalize a tag name for matching (lowercase, trim)
   *
   * @param displayName - Original tag name
   * @returns string - Normalized name
   *
   * Example:
   * ```typescript
   * DayTagService.normalizeTagName('  Vacation  '); // 'vacation'
   * DayTagService.normalizeTagName('New Medicine'); // 'new medicine'
   * ```
   */
  normalizeTagName(displayName: string): string;

  /**
   * Check if a tag name is valid (format validation)
   *
   * @param displayName - Tag name to validate
   * @returns ValidationResult - { isValid: boolean, errors: ValidationError[] }
   *
   * Validation Rules:
   * - Length: 1-50 characters
   * - Characters: alphanumeric + spaces + hyphens + underscores
   * - No forbidden chars: < > { } [ ] \ / | " '
   *
   * Example:
   * ```typescript
   * DayTagService.validateTagName('Vacation'); // { isValid: true, errors: [] }
   * DayTagService.validateTagName('Tag<script>'); // { isValid: false, errors: [...] }
   * DayTagService.validateTagName(''); // { isValid: false, errors: ['Tag cannot be empty'] }
   * ```
   */
  validateTagName(displayName: string): ValidationResult;
}

// ============================================================================
// Type Definitions (referenced by contract)
// ============================================================================

/**
 * Input for creating a new tag
 */
export interface CreateTagInput {
  /** User's preferred display name (preserves capitalization) */
  displayName: string;
}

/**
 * Filter criteria for multi-tag queries
 */
export interface TagFilter {
  /** Array of tag names (will be normalized) */
  tags: string[];
  /** Match logic: 'any' = OR, 'all' = AND */
  matchMode: 'any' | 'all';
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Not found error (tag or association doesn't exist)
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (duplicate association)
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Business rule violation error (e.g., max tags exceeded)
 */
export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

// ============================================================================
// Performance Requirements
// ============================================================================

/**
 * Performance targets (from spec Success Criteria):
 *
 * - SC-001: Tag operations (create, add to day) complete in <2 seconds
 * - SC-002: Filtering 1000+ entries by tags returns results in <3 seconds
 * - Calendar rendering with tagged dates: <100ms to compute marked dates
 *
 * Implementation notes:
 * - Use indexed queries (date, tagId indexes)
 * - Leverage Drizzle's prepared statements
 * - Batch operations in transactions
 * - Cache frequently accessed data (all tags, current month's tagged dates)
 */

// ============================================================================
// Error Handling Strategy
// ============================================================================

/**
 * Service methods throw typed errors for different failure scenarios:
 *
 * - ValidationError: Invalid input (caught by validation service first)
 * - NotFoundError: Tag/association doesn't exist (404 equivalent)
 * - ConflictError: Duplicate operation (409 equivalent)
 * - BusinessRuleError: Rule violation (e.g., max tags) (422 equivalent)
 * - Generic Error: Unexpected database errors
 *
 * Stores catch these errors and set error state for UI display.
 * UI shows user-friendly messages via Alert or inline error text.
 */

// ============================================================================
// Testing Requirements
// ============================================================================

/**
 * Test coverage requirements (TDD):
 *
 * Unit tests (90% coverage target):
 * - Each method with valid input
 * - Each validation rule (invalid input)
 * - Edge cases (empty results, max limits, duplicates)
 * - Error conditions (not found, conflicts)
 * - Normalization logic
 *
 * Integration tests:
 * - Full workflow: create tag → add to day → fetch entries → filter → export
 * - Retroactive application: add tag to past day with existing entries
 * - Cascade delete: delete tag removes associations
 * - Performance: filter 1000 entries in <3s
 *
 * Test utilities:
 * - Mock database with in-memory SQLite
 * - Seed data helpers
 * - Assertion helpers for validation results
 */
