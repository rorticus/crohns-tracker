/**
 * Type Definitions Contract: Day Tags
 *
 * Defines all TypeScript types, interfaces, and constants for the Day Tags feature.
 * This contract ensures type safety across services, stores, and components.
 *
 * Implementation: src/types/dayTag.ts
 */

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Day Tag Entity
 *
 * Represents a unique tag that can be applied to calendar days.
 * Tags are reusable across multiple dates.
 */
export interface DayTag {
  /** Unique identifier (database primary key) */
  id: number;

  /** Normalized lowercase tag name for matching (unique) */
  name: string;

  /** Original user-provided name (preserves capitalization) */
  displayName: string;

  /** ISO 8601 timestamp when tag was created */
  createdAt: string;

  /** Number of days currently using this tag (denormalized for performance) */
  usageCount: number;
}

/**
 * Day Tag Association Entity
 *
 * Links a tag to a specific calendar date (many-to-many relationship).
 */
export interface DayTagAssociation {
  /** Unique identifier (database primary key) */
  id: number;

  /** Foreign key to dayTags table */
  tagId: number;

  /** Calendar date in YYYY-MM-DD format (ISO 8601) */
  date: string;

  /** ISO 8601 timestamp when association was created */
  createdAt: string;
}

// ============================================================================
// Extended Entry Types (with Day Tags)
// ============================================================================

/**
 * Entry with Inherited Day Tags
 *
 * Extends the base CombinedEntry type to include day tags.
 * Day tags are computed at query time, not stored on the entry.
 */
export interface EntryWithDayTags extends CombinedEntry {
  /** Array of day tags for the entry's date (computed, read-only) */
  dayTags: DayTag[];
}

/**
 * Re-export CombinedEntry for convenience
 * (CombinedEntry = BowelMovementEntry | NoteEntry)
 */
export type { CombinedEntry } from './entry';

// ============================================================================
// Input Types (for Service Methods)
// ============================================================================

/**
 * Input for creating a new tag
 */
export interface CreateTagInput {
  /** User's preferred display name (preserves capitalization) */
  displayName: string;
}

/**
 * Input for adding a tag to a date
 */
export interface AddTagToDayInput {
  /** Tag ID or displayName (if string, will create/find tag) */
  tag: number | string;

  /** Date in YYYY-MM-DD format */
  date: string;
}

/**
 * Input for removing a tag from a date
 */
export interface RemoveTagFromDayInput {
  /** Tag ID or displayName */
  tag: number | string;

  /** Date in YYYY-MM-DD format */
  date: string;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Tag Filter Configuration
 *
 * Used for filtering entries by day tags.
 */
export interface TagFilter {
  /** Array of tag names (will be normalized for matching) */
  tags: string[];

  /** Match logic: 'any' = OR (date has ANY tag), 'all' = AND (date has ALL tags) */
  matchMode: 'any' | 'all';
}

/**
 * Extended Export Options (with Tag Filtering)
 *
 * Extends existing ExportOptions to include tag-based filtering.
 */
export interface ExportOptionsWithTags extends ExportOptions {
  /** Optional tag filter to apply before export */
  tagFilter?: TagFilter;
}

/**
 * Re-export ExportOptions for convenience
 */
export type { ExportOptions } from './export';

// ============================================================================
// UI Component Props
// ============================================================================

/**
 * Props for DayTagManager modal component
 */
export interface DayTagManagerProps {
  /** Date being managed (YYYY-MM-DD) */
  date: string;

  /** Whether modal is visible */
  visible: boolean;

  /** Callback when modal is dismissed */
  onClose: () => void;

  /** Optional callback when tags change */
  onTagsChanged?: (tags: string[]) => void;
}

/**
 * Props for DayTagPicker component (autocomplete input)
 */
export interface DayTagPickerProps {
  /** Currently selected tags (displayNames) */
  selectedTags: string[];

  /** Callback when tags change */
  onTagsChange: (tags: string[]) => void;

  /** All available tags (for autocomplete) */
  availableTags: DayTag[];

  /** Maximum number of tags allowed */
  maxTags?: number;

  /** Placeholder text */
  placeholder?: string;

  /** Whether input is disabled */
  disabled?: boolean;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Props for DayTagBadge component (display tag)
 */
export interface DayTagBadgeProps {
  /** Tag displayName to show */
  tagName: string;

  /** Whether tag is inherited from day (vs entry-level) */
  isInherited?: boolean;

  /** Whether badge is pressable (for deletion) */
  onPress?: () => void;

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Test ID for testing */
  testID?: string;
}

/**
 * Props for DayTagFilter component (filter UI)
 */
export interface DayTagFilterProps {
  /** Current filter (null if no filter) */
  currentFilter: TagFilter | null;

  /** Callback when filter changes */
  onFilterChange: (filter: TagFilter | null) => void;

  /** All available tags (for selection) */
  availableTags: DayTag[];

  /** Whether filter is being applied (loading state) */
  isApplying?: boolean;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Props for DayTagIndicator component (calendar visual)
 */
export interface DayTagIndicatorProps {
  /** Number of tags for this day */
  tagCount: number;

  /** Tag displayNames (for accessibility) */
  tagNames: string[];

  /** Visual style variant */
  variant?: 'dot' | 'badge' | 'compact';

  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result structure
 */
export interface ValidationResult {
  /** Whether input is valid */
  isValid: boolean;

  /** Array of validation errors (empty if valid) */
  errors: ValidationError[];
}

/**
 * Validation error structure
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string;

  /** User-friendly error message */
  message: string;

  /** Optional error code (for programmatic handling) */
  code?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Tag validation constraints
 */
export const TAG_VALIDATION = {
  /** Minimum tag name length */
  MIN_LENGTH: 1,

  /** Maximum tag name length */
  MAX_LENGTH: 50,

  /** Maximum tags allowed per day */
  MAX_TAGS_PER_DAY: 10,

  /** Allowed character pattern (alphanumeric + spaces + hyphens + underscores) */
  ALLOWED_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,

  /** Forbidden characters */
  FORBIDDEN_CHARS: /[<>{}[\]\\\/|"']/,
} as const;

/**
 * Tag visual styling constants
 */
export const TAG_STYLES = {
  /** Day tag color scheme (orange theme) */
  DAY_TAG: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9500',
    textColor: '#E65100',
    iconColor: '#FF9500',
  },

  /** Entry tag color scheme (blue theme) */
  ENTRY_TAG: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    textColor: '#0D47A1',
    iconColor: '#007AFF',
  },

  /** Size variants */
  SIZES: {
    small: {
      fontSize: 11,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
    },
    medium: {
      fontSize: 13,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    large: {
      fontSize: 15,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
  },
} as const;

/**
 * Tag feature performance targets (from spec)
 */
export const TAG_PERFORMANCE = {
  /** Maximum time for tag operations (create, add to day) */
  TAG_OPERATION_MAX_MS: 2000,

  /** Maximum time for filtering 1000+ entries */
  FILTER_MAX_MS: 3000,

  /** Maximum time for calendar render with tags */
  CALENDAR_RENDER_MAX_MS: 100,

  /** Debounce delay for autocomplete search */
  AUTOCOMPLETE_DEBOUNCE_MS: 300,
} as const;

/**
 * Tag test IDs (for testing)
 */
export const TAG_TEST_IDS = {
  // DayTagManager modal
  DAY_TAG_MANAGER: 'day-tag-manager',
  DAY_TAG_MANAGER_CLOSE: 'day-tag-manager-close',
  DAY_TAG_MANAGER_SAVE: 'day-tag-manager-save',

  // DayTagPicker
  DAY_TAG_PICKER_INPUT: 'day-tag-picker-input',
  DAY_TAG_PICKER_SUGGESTION: 'day-tag-picker-suggestion',

  // DayTagBadge
  DAY_TAG_BADGE: 'day-tag-badge',
  DAY_TAG_BADGE_DELETE: 'day-tag-badge-delete',

  // DayTagFilter
  DAY_TAG_FILTER: 'day-tag-filter',
  DAY_TAG_FILTER_CLEAR: 'day-tag-filter-clear',
  DAY_TAG_FILTER_APPLY: 'day-tag-filter-apply',

  // DayTagIndicator (calendar)
  DAY_TAG_INDICATOR: 'day-tag-indicator',
} as const;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard: Check if entry has day tags
 */
export function hasEntryDayTags(entry: CombinedEntry): entry is EntryWithDayTags {
  return 'dayTags' in entry && Array.isArray((entry as EntryWithDayTags).dayTags);
}

/**
 * Type guard: Check if value is a valid TagFilter
 */
export function isTagFilter(value: unknown): value is TagFilter {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tags' in value &&
    Array.isArray((value as TagFilter).tags) &&
    'matchMode' in value &&
    ((value as TagFilter).matchMode === 'any' || (value as TagFilter).matchMode === 'all')
  );
}

/**
 * Type guard: Check if value is a DayTag
 */
export function isDayTag(value: unknown): value is DayTag {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'displayName' in value &&
    'createdAt' in value &&
    'usageCount' in value
  );
}

// ============================================================================
// Drizzle Schema Types (for reference)
// ============================================================================

/**
 * Drizzle table definitions (for src/db/schema.ts)
 *
 * Note: These are not the actual Drizzle definitions, just TypeScript types
 * for reference. Actual Drizzle schema uses sqliteTable, text(), integer(), etc.
 */

/**
 * dayTags table schema (reference)
 */
export interface DayTagsTableSchema {
  id: number;              // integer, PRIMARY KEY, AUTOINCREMENT
  name: string;            // text, NOT NULL, UNIQUE
  displayName: string;     // text, NOT NULL
  createdAt: string;       // text, DEFAULT CURRENT_TIMESTAMP
  usageCount: number;      // integer, DEFAULT 0
}

/**
 * dayTagAssociations table schema (reference)
 */
export interface DayTagAssociationsTableSchema {
  id: number;              // integer, PRIMARY KEY, AUTOINCREMENT
  tagId: number;           // integer, NOT NULL, FOREIGN KEY → dayTags.id
  date: string;            // text, NOT NULL, YYYY-MM-DD
  createdAt: string;       // text, DEFAULT CURRENT_TIMESTAMP
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Tag-specific error classes
 */

/**
 * Tag not found error
 */
export class TagNotFoundError extends Error {
  constructor(tagId: number) {
    super(`Tag with ID ${tagId} not found`);
    this.name = 'TagNotFoundError';
  }
}

/**
 * Tag name already exists error
 */
export class DuplicateTagError extends Error {
  constructor(tagName: string) {
    super(`Tag "${tagName}" already exists`);
    this.name = 'DuplicateTagError';
  }
}

/**
 * Tag validation error
 */
export class TagValidationError extends Error {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Tag validation failed');
    this.name = 'TagValidationError';
    this.errors = errors;
  }
}

/**
 * Association already exists error
 */
export class DuplicateAssociationError extends Error {
  constructor(tagName: string, date: string) {
    super(`Tag "${tagName}" is already applied to ${date}`);
    this.name = 'DuplicateAssociationError';
  }
}

/**
 * Max tags per day exceeded error
 */
export class MaxTagsExceededError extends Error {
  constructor(date: string, maxTags: number) {
    super(`Cannot add more than ${maxTags} tags to ${date}`);
    this.name = 'MaxTagsExceededError';
  }
}

// ============================================================================
// Type Exports Summary
// ============================================================================

/**
 * Public API exports (for src/types/dayTag.ts):
 *
 * Entities:
 * - DayTag
 * - DayTagAssociation
 * - EntryWithDayTags
 *
 * Input types:
 * - CreateTagInput
 * - AddTagToDayInput
 * - RemoveTagFromDayInput
 *
 * Filter types:
 * - TagFilter
 * - ExportOptionsWithTags
 *
 * Component props:
 * - DayTagManagerProps
 * - DayTagPickerProps
 * - DayTagBadgeProps
 * - DayTagFilterProps
 * - DayTagIndicatorProps
 *
 * Validation:
 * - ValidationResult
 * - ValidationError
 *
 * Constants:
 * - TAG_VALIDATION
 * - TAG_STYLES
 * - TAG_PERFORMANCE
 * - TAG_TEST_IDS
 *
 * Utility types:
 * - hasEntryDayTags (type guard)
 * - isTagFilter (type guard)
 * - isDayTag (type guard)
 *
 * Errors:
 * - TagNotFoundError
 * - DuplicateTagError
 * - TagValidationError
 * - DuplicateAssociationError
 * - MaxTagsExceededError
 */

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Service method signature
 * ```typescript
 * class DayTagService {
 *   static async createTag(input: CreateTagInput): Promise<DayTag> {
 *     // Implementation
 *   }
 *
 *   static async addTagToDay(tagId: number, date: string): Promise<DayTagAssociation> {
 *     // Validate
 *     if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
 *       throw new TagValidationError([
 *         { field: 'date', message: 'Invalid date format' }
 *       ]);
 *     }
 *     // Implementation
 *   }
 * }
 * ```
 *
 * Example 2: Component with props
 * ```typescript
 * export function DayTagPicker(props: DayTagPickerProps) {
 *   const { selectedTags, onTagsChange, availableTags, maxTags = TAG_VALIDATION.MAX_TAGS_PER_DAY } = props;
 *   // Implementation
 * }
 * ```
 *
 * Example 3: Type guard usage
 * ```typescript
 * function renderEntry(entry: CombinedEntry) {
 *   if (hasEntryDayTags(entry)) {
 *     return entry.dayTags.map(tag => <DayTagBadge tagName={tag.displayName} isInherited />);
 *   }
 *   return null;
 * }
 * ```
 *
 * Example 4: Validation
 * ```typescript
 * function validateAndCreateTag(displayName: string): Promise<DayTag> {
 *   if (displayName.length > TAG_VALIDATION.MAX_LENGTH) {
 *     throw new TagValidationError([
 *       { field: 'displayName', message: `Tag must be ${TAG_VALIDATION.MAX_LENGTH} characters or less` }
 *     ]);
 *   }
 *   return DayTagService.createTag({ displayName });
 * }
 * ```
 */
