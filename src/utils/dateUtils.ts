import { DATE_FORMATS } from './constants';

/**
 * Date utility functions for the Crohns Tracker app
 */

// Format date for display
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format date for database storage (YYYY-MM-DD)
export const formatDateForDatabase = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

// Format time for display (12-hour format)
export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Format time for database storage (24-hour format HH:MM)
export const formatTimeForDatabase = (date: Date): string => {
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

// Get current date in database format
export const getCurrentDate = (): string => {
  return formatDateForDatabase(new Date());
};

// Get current time in database format
export const getCurrentTime = (): string => {
  return formatTimeForDatabase(new Date());
};

// Generate ISO timestamp from date and time strings
export const generateTimestamp = (date: string, time: string): string => {
  return new Date(`${date}T${time}:00.000Z`).toISOString();
};

// Parse ISO timestamp to date and time components
export const parseTimestamp = (timestamp: string): { date: string; time: string } => {
  const dateObj = new Date(timestamp);
  return {
    date: formatDateForDatabase(dateObj),
    time: formatTimeForDatabase(dateObj),
  };
};

// Check if a date is today
export const isToday = (date: string): boolean => {
  return date === getCurrentDate();
};

// Check if a date is in the past
export const isPastDate = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

// Check if a date is in the future
export const isFutureDate = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate > today;
};

// Get date range for calendar views
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);

  while (currentDate <= endDateObj) {
    dates.push(formatDateForDatabase(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Get start and end of week for a given date
export const getWeekRange = (date: string): { start: string; end: string } => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  const startOfWeek = new Date(dateObj);
  startOfWeek.setDate(dateObj.getDate() - dayOfWeek);

  const endOfWeek = new Date(dateObj);
  endOfWeek.setDate(dateObj.getDate() + (6 - dayOfWeek));

  return {
    start: formatDateForDatabase(startOfWeek),
    end: formatDateForDatabase(endOfWeek),
  };
};

// Get start and end of month for a given date
export const getMonthRange = (date: string): { start: string; end: string } => {
  const dateObj = new Date(date);

  const startOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  const endOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

  return {
    start: formatDateForDatabase(startOfMonth),
    end: formatDateForDatabase(endOfMonth),
  };
};

// Add days to a date
export const addDays = (date: string, days: number): string => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return formatDateForDatabase(dateObj);
};

// Subtract days from a date
export const subtractDays = (date: string, days: number): string => {
  return addDays(date, -days);
};

// Get days between two dates
export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Sort timestamps in chronological order
export const sortTimestamps = (timestamps: string[], descending = false): string[] => {
  return [...timestamps].sort((a, b) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
};

// Group entries by date
export const groupEntriesByDate = <T extends { date: string }>(entries: T[]): Record<string, T[]> => {
  return entries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, T[]>);
};

// Get relative date label (Today, Yesterday, etc.)
export const getRelativeDateLabel = (date: string): string => {
  const today = getCurrentDate();
  const yesterday = subtractDays(today, 1);
  const tomorrow = addDays(today, 1);

  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  if (date === tomorrow) return 'Tomorrow';

  return formatDateForDisplay(date);
};

// Validate date string format
export const isValidDateString = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj.toISOString().substr(0, 10) === date;
};

// Validate time string format
export const isValidTimeString = (time: string): boolean => {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};