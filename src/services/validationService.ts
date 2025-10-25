import {
  CreateBowelMovementInput,
  CreateNoteInput,
  ValidationResult,
  ValidationError,
  BristolScale,
  UrgencyLevel,
  NoteCategory,
} from '@/types/entry';

export class ValidationService {
  // Validate bowel movement input
  static validateBowelMovementInput(input: CreateBowelMovementInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate date
    const dateValidation = this.validateDateFormat(input.date);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    }

    // Validate time
    const timeValidation = this.validateTimeFormat(input.time);
    if (!timeValidation.isValid) {
      errors.push(...timeValidation.errors);
    }

    // Validate Bristol scale
    const bristolValidation = this.validateBristolScale(input.consistency);
    if (!bristolValidation.isValid) {
      errors.push(...bristolValidation.errors);
    }

    // Validate urgency level
    const urgencyValidation = this.validateUrgencyLevel(input.urgency);
    if (!urgencyValidation.isValid) {
      errors.push(...urgencyValidation.errors);
    }

    // Validate notes (if provided)
    if (input.notes !== undefined && input.notes !== null) {
      if (input.notes.length > 500) {
        errors.push({
          field: 'notes',
          message: 'Notes cannot exceed 500 characters',
          code: 'NOTES_TOO_LONG',
        });
      }
    }

    // Check if date is not in the future
    if (!this.isFutureDate(input.date)) {
      errors.push({
        field: 'date',
        message: 'Entry date cannot be in the future',
        code: 'FUTURE_DATE_NOT_ALLOWED',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate note input
  static validateNoteInput(input: CreateNoteInput): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate date
    const dateValidation = this.validateDateFormat(input.date);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    }

    // Validate time
    const timeValidation = this.validateTimeFormat(input.time);
    if (!timeValidation.isValid) {
      errors.push(...timeValidation.errors);
    }

    // Validate category
    if (!this.isValidNoteCategory(input.category)) {
      errors.push({
        field: 'category',
        message: 'Invalid note category',
        code: 'INVALID_CATEGORY',
      });
    }

    // Validate content
    if (!input.content || input.content.trim().length === 0) {
      errors.push({
        field: 'content',
        message: 'Note content is required',
        code: 'CONTENT_REQUIRED',
      });
    } else if (input.content.length > 1000) {
      errors.push({
        field: 'content',
        message: 'Note content cannot exceed 1000 characters',
        code: 'CONTENT_TOO_LONG',
      });
    }

    // Check if date is not in the future
    if (!this.isFutureDate(input.date)) {
      errors.push({
        field: 'date',
        message: 'Entry date cannot be in the future',
        code: 'FUTURE_DATE_NOT_ALLOWED',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate date format (YYYY-MM-DD)
  static validateDateFormat(date: string): ValidationResult {
    const errors: ValidationError[] = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      errors.push({
        field: 'date',
        message: 'Date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT',
      });
    } else {
      // Check if date is valid
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().substr(0, 10) !== date) {
        errors.push({
          field: 'date',
          message: 'Invalid date',
          code: 'INVALID_DATE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate time format (HH:MM)
  static validateTimeFormat(time: string): ValidationResult {
    const errors: ValidationError[] = [];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(time)) {
      errors.push({
        field: 'time',
        message: 'Time must be in HH:MM format (24-hour)',
        code: 'INVALID_TIME_FORMAT',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate Bristol scale (1-7)
  static validateBristolScale(consistency: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Number.isInteger(consistency) || consistency < 1 || consistency > 7) {
      errors.push({
        field: 'consistency',
        message: 'Bristol scale consistency must be between 1 and 7',
        code: 'INVALID_BRISTOL_SCALE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate urgency level (1-4)
  static validateUrgencyLevel(urgency: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Number.isInteger(urgency) || urgency < 1 || urgency > 4) {
      errors.push({
        field: 'urgency',
        message: 'Urgency level must be between 1 and 4',
        code: 'INVALID_URGENCY_LEVEL',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check if note category is valid
  static isValidNoteCategory(category: string): category is NoteCategory {
    return ['food', 'exercise', 'medication', 'other'].includes(category);
  }

  // Check if date is in the future
  static isFutureDate(date: string): boolean {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for date-only comparison
    return inputDate <= today;
  }

  // Generate timestamp from date and time
  static generateTimestamp(date: string, time: string): string {
    return new Date(`${date}T${time}:00.000Z`).toISOString();
  }

  // Validate Bristol scale type guard
  static isBristolScale(value: number): value is BristolScale {
    return Number.isInteger(value) && value >= 1 && value <= 7;
  }

  // Validate urgency level type guard
  static isUrgencyLevel(value: number): value is UrgencyLevel {
    return Number.isInteger(value) && value >= 1 && value <= 4;
  }
}