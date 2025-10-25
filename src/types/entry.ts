// Re-export schema types for consistency
export type {
  Entry,
  NewEntry,
  BowelMovement,
  NewBowelMovement,
  Note,
  NewNote,
  EntryType,
  NoteCategory,
} from '@/db/schema';

// Bristol Scale and Urgency types
export type BristolScale = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type UrgencyLevel = 1 | 2 | 3 | 4;

// Combined entry types for UI
export interface BowelMovementEntry {
  id: number;
  type: 'bowel_movement';
  date: string;
  time: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  bowelMovement: {
    consistency: BristolScale;
    urgency: UrgencyLevel;
    notes?: string;
  };
}

export interface NoteEntry {
  id: number;
  type: 'note';
  date: string;
  time: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  note: {
    category: NoteCategory;
    content: string;
    tags?: string;
  };
}

export type CombinedEntry = BowelMovementEntry | NoteEntry;

// Form input types
export interface CreateBowelMovementInput {
  date: string;
  time: string;
  consistency: BristolScale;
  urgency: UrgencyLevel;
  notes?: string;
}

export interface CreateNoteInput {
  date: string;
  time: string;
  category: NoteCategory;
  content: string;
  tags?: string;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Bristol Scale reference
export const BRISTOL_SCALE_DESCRIPTIONS = {
  1: 'Separate hard lumps',
  2: 'Sausage-shaped but lumpy',
  3: 'Sausage-shaped with cracks',
  4: 'Sausage-shaped, smooth and soft',
  5: 'Soft blobs with clear edges',
  6: 'Fluffy pieces with ragged edges',
  7: 'Watery, no solid pieces',
} as const;

// Urgency level reference
export const URGENCY_LEVEL_DESCRIPTIONS = {
  1: 'None - No urgency felt',
  2: 'Mild - Slight urgency, can wait',
  3: 'Moderate - Need to go soon',
  4: 'Urgent - Immediate need',
} as const;

// Note category icons/colors (for UI)
export const NOTE_CATEGORY_CONFIG = {
  food: { icon: '🍽️', color: '#4CAF50', label: 'Food' },
  exercise: { icon: '🏃', color: '#2196F3', label: 'Exercise' },
  medication: { icon: '💊', color: '#FF9800', label: 'Medication' },
  other: { icon: '📝', color: '#9E9E9E', label: 'Other' },
} as const;