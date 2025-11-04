/**
 * Date Utils Tests
 * 
 * Tests for date utility functions, particularly focusing on timezone handling
 * to ensure dates are correctly handled in the user's local timezone.
 */

import {
  getCurrentDate,
  getCurrentTime,
  formatDateForDatabase,
  isValidDateString,
  isValidTimeString,
  isFutureDate,
} from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  describe('getCurrentDate', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const date = getCurrentDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return local date, not UTC date', () => {
      const date = getCurrentDate();
      const now = new Date();
      
      // Extract local date components
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const expectedLocalDate = `${year}-${month}-${day}`;
      
      expect(date).toBe(expectedLocalDate);
      
      // Ensure it's NOT the UTC date (which could be different)
      const utcDate = now.toISOString().split('T')[0];
      // They might be the same, but our function should use local date
      expect(date).toBe(expectedLocalDate);
    });

    it('should be valid for validation', () => {
      const date = getCurrentDate();
      expect(isValidDateString(date)).toBe(true);
    });

    it('should not be a future date', () => {
      const date = getCurrentDate();
      expect(isFutureDate(date)).toBe(false);
    });
  });

  describe('getCurrentTime', () => {
    it('should return current time in HH:MM format', () => {
      const time = getCurrentTime();
      expect(time).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
    });

    it('should return local time, not UTC time', () => {
      const time = getCurrentTime();
      const now = new Date();
      
      // Extract local time components
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const expectedLocalTime = `${hours}:${minutes}`;
      
      expect(time).toBe(expectedLocalTime);
    });

    it('should be valid for validation', () => {
      const time = getCurrentTime();
      expect(isValidTimeString(time)).toBe(true);
    });
  });

  describe('formatDateForDatabase', () => {
    it('should format Date object to YYYY-MM-DD using local timezone', () => {
      const date = new Date(2025, 9, 25); // October 25, 2025 (month is 0-indexed)
      const formatted = formatDateForDatabase(date);
      expect(formatted).toBe('2025-10-25');
    });

    it('should handle date string input', () => {
      const formatted = formatDateForDatabase('2025-10-25');
      expect(formatted).toBe('2025-10-25');
    });

    it('should use local date, not UTC', () => {
      // Create a date at 11 PM local time
      const date = new Date();
      date.setHours(23, 0, 0, 0);
      
      const formatted = formatDateForDatabase(date);
      
      // Get expected local date
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const expectedLocalDate = `${year}-${month}-${day}`;
      
      expect(formatted).toBe(expectedLocalDate);
    });
  });

  describe('isFutureDate', () => {
    it('should return false for today', () => {
      const today = getCurrentDate();
      expect(isFutureDate(today)).toBe(false);
    });

    it('should return false for past dates', () => {
      expect(isFutureDate('2020-01-01')).toBe(false);
    });

    it('should return true for future dates', () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowStr = `${year}-${month}-${day}`;
      
      expect(isFutureDate(tomorrowStr)).toBe(true);
    });
  });

  describe('Date validation', () => {
    it('should validate correct date formats', () => {
      expect(isValidDateString('2025-10-25')).toBe(true);
      expect(isValidDateString('2025-01-01')).toBe(true);
      expect(isValidDateString('2025-12-31')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDateString('2025/10/25')).toBe(false);
      expect(isValidDateString('25-10-2025')).toBe(false);
      expect(isValidDateString('2025-13-01')).toBe(false); // Invalid month
      expect(isValidDateString('2025-10-32')).toBe(false); // Invalid day
      expect(isValidDateString('invalid')).toBe(false);
    });
  });

  describe('Time validation', () => {
    it('should validate correct time formats', () => {
      expect(isValidTimeString('14:30')).toBe(true);
      expect(isValidTimeString('00:00')).toBe(true);
      expect(isValidTimeString('23:59')).toBe(true);
      expect(isValidTimeString('9:30')).toBe(true); // Single digit hour
    });

    it('should reject invalid time formats', () => {
      expect(isValidTimeString('24:00')).toBe(false); // Invalid hour
      expect(isValidTimeString('14:60')).toBe(false); // Invalid minute
      expect(isValidTimeString('14')).toBe(false); // Missing minutes
      expect(isValidTimeString('14:30:00')).toBe(false); // Includes seconds
      expect(isValidTimeString('invalid')).toBe(false);
    });
  });
});
