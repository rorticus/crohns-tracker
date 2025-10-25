// App Configuration
export const APP_CONFIG = {
  DATABASE_NAME: 'crohns_tracker.db',
  VERSION: '1.0.0',
  MAX_ENTRIES_PER_DAY: 50,
  EXPORT_BATCH_SIZE: 1000,
} as const;

// Bristol Scale Constants
export const BRISTOL_SCALE = {
  MIN: 1,
  MAX: 7,
  DESCRIPTIONS: {
    1: 'Separate hard lumps',
    2: 'Sausage-shaped but lumpy',
    3: 'Sausage-shaped with cracks',
    4: 'Sausage-shaped, smooth and soft',
    5: 'Soft blobs with clear edges',
    6: 'Fluffy pieces with ragged edges',
    7: 'Watery, no solid pieces',
  },
} as const;

// Urgency Level Constants
export const URGENCY_LEVELS = {
  MIN: 1,
  MAX: 4,
  DESCRIPTIONS: {
    1: 'None - No urgency felt',
    2: 'Mild - Slight urgency, can wait',
    3: 'Moderate - Need to go soon',
    4: 'Urgent - Immediate need',
  },
} as const;

// Note Categories
export const NOTE_CATEGORIES = {
  FOOD: 'food',
  EXERCISE: 'exercise',
  MEDICATION: 'medication',
  OTHER: 'other',
} as const;

export const NOTE_CATEGORY_CONFIG = {
  [NOTE_CATEGORIES.FOOD]: {
    icon: '🍽️',
    color: '#4CAF50',
    label: 'Food',
    accessibilityLabel: 'Food category',
  },
  [NOTE_CATEGORIES.EXERCISE]: {
    icon: '🏃',
    color: '#2196F3',
    label: 'Exercise',
    accessibilityLabel: 'Exercise category',
  },
  [NOTE_CATEGORIES.MEDICATION]: {
    icon: '💊',
    color: '#FF9800',
    label: 'Medication',
    accessibilityLabel: 'Medication category',
  },
  [NOTE_CATEGORIES.OTHER]: {
    icon: '📝',
    color: '#9E9E9E',
    label: 'Other',
    accessibilityLabel: 'Other category',
  },
} as const;

// Performance Constants
export const PERFORMANCE = {
  FLATLIST_INITIAL_RENDER: 15,
  FLATLIST_WINDOW_SIZE: 10,
  FLATLIST_MAX_TO_RENDER_PER_BATCH: 10,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
} as const;

// Validation Constants
export const VALIDATION = {
  MAX_NOTE_LENGTH: 1000,
  MAX_BOWEL_MOVEMENT_NOTES_LENGTH: 500,
  MAX_TAGS_LENGTH: 200,
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:MM',
} as const;

// Accessibility Constants
export const ACCESSIBILITY = {
  MIN_TOUCH_TARGET_SIZE: 44,
  FONT_SCALE_FACTORS: {
    SMALL: 0.85,
    NORMAL: 1.0,
    LARGE: 1.15,
    EXTRA_LARGE: 1.3,
  },
  TIMEOUT_DURATIONS: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
  },
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#34C759',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  SUCCESS: '#34C759',
  INFO: '#5AC8FA',

  TEXT: {
    PRIMARY: '#1C1C1E',
    SECONDARY: '#3A3A3C',
    TERTIARY: '#8E8E93',
    INVERSE: '#FFFFFF',
  },

  BACKGROUND: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#F2F2F7',
    TERTIARY: '#E5E5EA',
  },

  BORDER: {
    PRIMARY: '#D1D1D6',
    SECONDARY: '#E5E5EA',
  },

  SHADOW: '#000000',
} as const;

// Typography
export const TYPOGRAPHY = {
  SIZES: {
    CAPTION: 12,
    FOOTNOTE: 13,
    SUBHEADLINE: 15,
    CALLOUT: 16,
    BODY: 17,
    HEADLINE: 17,
    TITLE3: 20,
    TITLE2: 22,
    TITLE1: 28,
    LARGE_TITLE: 34,
  },
  WEIGHTS: {
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_YEAR: 'MMM d, yyyy',
  DISPLAY_SHORT: 'MMM d',
  DATABASE: 'yyyy-MM-dd',
  TIME_12H: 'h:mm a',
  TIME_24H: 'HH:mm',
  TIMESTAMP: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Export Formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  TXT: 'txt',
} as const;

// Entry Types
export const ENTRY_TYPES = {
  BOWEL_MOVEMENT: 'bowel_movement',
  NOTE: 'note',
} as const;

// Test IDs for E2E testing
export const TEST_IDS = {
  CALENDAR_VIEW: 'calendar-view',
  TIMELINE_VIEW: 'timeline-view',
  ADD_ENTRY_BUTTON: 'add-entry-button',
  BOWEL_MOVEMENT_FORM: 'bowel-movement-form',
  NOTE_FORM: 'note-form',
  BRISTOL_SCALE_PICKER: 'bristol-scale-picker',
  URGENCY_PICKER: 'urgency-picker',
  CATEGORY_PICKER: 'category-picker',
  SAVE_BUTTON: 'save-button',
  CANCEL_BUTTON: 'cancel-button',
  EXPORT_BUTTON: 'export-button',
  DATE_PICKER: 'date-picker',
  TIME_PICKER: 'time-picker',
} as const;