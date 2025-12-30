/**
 * Day Tag Type Definitions
 *
 * TypeScript types and interfaces for the Day Tags feature.
 * Includes entities, validation rules, UI props, and constants.
 */

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Day Tag Entity
 *
 * Represents a unique tag that can be applied to calendar days.
 */
export interface DayTag {
  /** Unique identifier (database primary key) */
  id: number;

  /** Normalized lowercase tag name for matching (unique) */
  name: string;

  /** Original user-provided name (preserves capitalization) */
  displayName: string;

  /** Optional description/notes about the tag (e.g., "X pills 3x daily") */
  description?: string | null;

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
// Input Types
// ============================================================================

/**
 * Input for creating a new tag
 */
export interface CreateTagInput {
  /** User's preferred display name (preserves capitalization) */
  displayName: string;

  /** Optional description/notes about the tag */
  description?: string;
}

/**
 * Input for adding a tag to a date
 */
export interface AddTagToDayInput {
  /** Tag ID or displayName */
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
 */
export interface TagFilter {
  /** Array of tag names (will be normalized for matching) */
  tags: string[];

  /** Match logic: 'any' = OR (date has ANY tag), 'all' = AND (date has ALL tags) */
  matchMode: 'any' | 'all';
}

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
 * Props for DayTagPicker component
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
 * Props for DayTagBadge component
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
 * Props for DayTagFilter component
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
 * Props for DayTagIndicator component
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

  /** Optional error code */
  code?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Tag validation constraints
 */
export const TAG_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  MAX_TAGS_PER_DAY: 10,
  ALLOWED_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
  FORBIDDEN_CHARS: /[<>{}[\]\\\/|"']/,
} as const;

/**
 * Tag visual styling constants
 */
export const TAG_STYLES = {
  DAY_TAG: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9500',
    textColor: '#E65100',
    iconColor: '#FF9500',
  },
  ENTRY_TAG: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    textColor: '#0D47A1',
    iconColor: '#007AFF',
  },
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
 * Tag test IDs
 */
export const TAG_TEST_IDS = {
  DAY_TAG_MANAGER: 'day-tag-manager',
  DAY_TAG_MANAGER_CLOSE: 'day-tag-manager-close',
  DAY_TAG_MANAGER_SAVE: 'day-tag-manager-save',
  DAY_TAG_PICKER_INPUT: 'day-tag-picker-input',
  DAY_TAG_PICKER_SUGGESTION: 'day-tag-picker-suggestion',
  DAY_TAG_BADGE: 'day-tag-badge',
  DAY_TAG_BADGE_DELETE: 'day-tag-badge-delete',
  DAY_TAG_FILTER: 'day-tag-filter',
  DAY_TAG_FILTER_CLEAR: 'day-tag-filter-clear',
  DAY_TAG_FILTER_APPLY: 'day-tag-filter-apply',
  DAY_TAG_INDICATOR: 'day-tag-indicator',
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a valid TagFilter
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
 * Check if value is a DayTag
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
// Error Types
// ============================================================================

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
 * Duplicate tag error
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
 * Duplicate association error
 */
export class DuplicateAssociationError extends Error {
  constructor(tagName: string, date: string) {
    super(`Tag "${tagName}" is already applied to ${date}`);
    this.name = 'DuplicateAssociationError';
  }
}

/**
 * Max tags exceeded error
 */
export class MaxTagsExceededError extends Error {
  constructor(date: string, maxTags: number) {
    super(`Cannot add more than ${maxTags} tags to ${date}`);
    this.name = 'MaxTagsExceededError';
  }
}
