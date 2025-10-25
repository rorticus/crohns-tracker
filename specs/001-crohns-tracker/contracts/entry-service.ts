/**
 * Entry Service Contracts
 * Defines TypeScript interfaces for data operations in the Crohns Symptom Tracker
 */

// Base Types
export type EntryType = 'bowel_movement' | 'note';
export type NoteCategory = 'food' | 'exercise' | 'medication' | 'other';
export type BristolScale = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type UrgencyLevel = 1 | 2 | 3 | 4;

// Core Data Interfaces
export interface BaseEntry {
  id: number;
  type: EntryType;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  timestamp: string; // ISO string for precise ordering
  createdAt: string;
  updatedAt: string;
}

export interface BowelMovementData {
  consistency: BristolScale;
  urgency: UrgencyLevel;
  notes?: string;
}

export interface NoteData {
  category: NoteCategory;
  content: string;
  tags?: string; // Comma-separated
}

export interface BowelMovementEntry extends BaseEntry {
  type: 'bowel_movement';
  bowelMovement: BowelMovementData;
}

export interface NoteEntry extends BaseEntry {
  type: 'note';
  note: NoteData;
}

export type Entry = BowelMovementEntry | NoteEntry;

// Input/Output Types
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

export interface UpdateBowelMovementInput extends Partial<CreateBowelMovementInput> {
  id: number;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  id: number;
}

export interface GetEntriesFilter {
  startDate?: string;
  endDate?: string;
  type?: EntryType;
  category?: NoteCategory;
  limit?: number;
  offset?: number;
}

export interface GetEntriesResponse {
  entries: Entry[];
  total: number;
  hasMore: boolean;
}

// Service Interface
export interface EntryService {
  // Create operations
  createBowelMovement(input: CreateBowelMovementInput): Promise<BowelMovementEntry>;
  createNote(input: CreateNoteInput): Promise<NoteEntry>;

  // Read operations
  getEntry(id: number): Promise<Entry | null>;
  getEntries(filter?: GetEntriesFilter): Promise<GetEntriesResponse>;
  getEntriesForDate(date: string): Promise<Entry[]>;
  getEntriesInDateRange(startDate: string, endDate: string): Promise<Entry[]>;

  // Update operations
  updateBowelMovement(input: UpdateBowelMovementInput): Promise<BowelMovementEntry>;
  updateNote(input: UpdateNoteInput): Promise<NoteEntry>;

  // Delete operations
  deleteEntry(id: number): Promise<void>;
  deleteEntriesInDateRange(startDate: string, endDate: string): Promise<number>; // Returns count

  // Utility operations
  getEntryCount(filter?: GetEntriesFilter): Promise<number>;
  getLatestEntries(limit: number): Promise<Entry[]>;
}

// Validation Interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface EntryValidator {
  validateBowelMovementInput(input: CreateBowelMovementInput): ValidationResult;
  validateNoteInput(input: CreateNoteInput): ValidationResult;
  validateDateFormat(date: string): ValidationResult;
  validateTimeFormat(time: string): ValidationResult;
  validateBristolScale(consistency: number): ValidationResult;
  validateUrgencyLevel(urgency: number): ValidationResult;
}

// Error Types
export class EntryNotFoundError extends Error {
  constructor(id: number) {
    super(`Entry with id ${id} not found`);
    this.name = 'EntryNotFoundError';
  }
}

export class ValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(`Database error: ${message}`);
    this.name = 'DatabaseError';
  }
}