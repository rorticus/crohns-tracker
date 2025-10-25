/**
 * Tag Utility Functions
 *
 * Helper functions for tag normalization, parsing, and formatting.
 */

import { TAG_VALIDATION, type ValidationResult, type ValidationError } from '../types/dayTag';

/**
 * Normalize a tag name for matching
 *
 * Converts to lowercase and trims whitespace.
 *
 * @param tagName - Original tag name
 * @returns Normalized tag name
 *
 * @example
 * normalizeTagName('  Vacation  '); // 'vacation'
 * normalizeTagName('New Medicine'); // 'new medicine'
 */
export function normalizeTagName(tagName: string): string {
  return tagName.trim().toLowerCase();
}

/**
 * Validate a tag name
 *
 * Checks length, character restrictions, and forbidden patterns.
 *
 * @param tagName - Tag name to validate
 * @returns Validation result with errors if invalid
 *
 * @example
 * validateTagName('Vacation'); // { isValid: true, errors: [] }
 * validateTagName(''); // { isValid: false, errors: [{ field: 'displayName', message: '...' }] }
 */
export function validateTagName(tagName: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Length validation
  if (tagName.trim().length < TAG_VALIDATION.MIN_LENGTH) {
    errors.push({
      field: 'displayName',
      message: 'Tag cannot be empty',
      code: 'TAG_EMPTY',
    });
  }

  if (tagName.length > TAG_VALIDATION.MAX_LENGTH) {
    errors.push({
      field: 'displayName',
      message: `Tag must be ${TAG_VALIDATION.MAX_LENGTH} characters or less`,
      code: 'TAG_TOO_LONG',
    });
  }

  // Character validation
  if (!TAG_VALIDATION.ALLOWED_PATTERN.test(tagName)) {
    errors.push({
      field: 'displayName',
      message: 'Tag can only contain letters, numbers, spaces, hyphens, and underscores',
      code: 'TAG_INVALID_CHARS',
    });
  }

  // Forbidden characters
  if (TAG_VALIDATION.FORBIDDEN_CHARS.test(tagName)) {
    errors.push({
      field: 'displayName',
      message: 'Tag contains invalid characters',
      code: 'TAG_FORBIDDEN_CHARS',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse comma-separated tags
 *
 * Splits a string of comma-separated tags, trims each, and removes empties.
 *
 * @param tagsString - Comma-separated tag string
 * @returns Array of tag names
 *
 * @example
 * parseTagsString('vacation, new medicine, '); // ['vacation', 'new medicine']
 */
export function parseTagsString(tagsString: string): string[] {
  if (!tagsString || tagsString.trim() === '') {
    return [];
  }

  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Format tags array to comma-separated string
 *
 * @param tags - Array of tag names
 * @returns Comma-separated string
 *
 * @example
 * formatTagsString(['vacation', 'new medicine']); // 'vacation, new medicine'
 */
export function formatTagsString(tags: string[]): string {
  return tags.join(', ');
}

/**
 * Deduplicate tags (case-insensitive)
 *
 * Removes duplicate tags based on normalized names, preserving first occurrence.
 *
 * @param tags - Array of tag names
 * @returns Deduplicated array
 *
 * @example
 * deduplicateTags(['Vacation', 'vacation', 'Work']); // ['Vacation', 'Work']
 */
export function deduplicateTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const normalized = normalizeTagName(tag);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Truncate long tag names for display
 *
 * @param tagName - Tag name to truncate
 * @param maxLength - Maximum length (default: 20)
 * @returns Truncated tag name with ellipsis if needed
 *
 * @example
 * truncateTagName('Very Long Tag Name Here', 15); // 'Very Long Tag...'
 */
export function truncateTagName(tagName: string, maxLength: number = 20): string {
  if (tagName.length <= maxLength) {
    return tagName;
  }
  return tagName.substring(0, maxLength - 3) + '...';
}

/**
 * Sort tags alphabetically (case-insensitive)
 *
 * @param tags - Array of tag names
 * @returns Sorted array
 */
export function sortTagsAlphabetically(tags: string[]): string[] {
  return [...tags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/**
 * Sort tags by usage count
 *
 * @param tags - Array of DayTag objects
 * @returns Sorted array (highest usage first)
 */
export function sortTagsByUsage<T extends { usageCount: number; displayName: string }>(
  tags: T[]
): T[] {
  return [...tags].sort((a, b) => {
    // First by usage count (descending)
    if (b.usageCount !== a.usageCount) {
      return b.usageCount - a.usageCount;
    }
    // Then alphabetically (ascending)
    return a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase());
  });
}
