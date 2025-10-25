/**
 * UI State Management Contracts
 * Defines TypeScript interfaces for Zustand stores and UI state
 */

import { Entry, EntryType, NoteCategory } from './entry-service';
import { ExportOptions, ExportResult } from './export-service';

// Calendar State
export interface CalendarState {
  selectedDate: string; // YYYY-MM-DD
  currentMonth: string; // YYYY-MM format
  viewMode: 'month' | 'week';
  highlightedDates: string[]; // Dates with entries
  isLoading: boolean;
}

export interface CalendarActions {
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (month: string) => void;
  setViewMode: (mode: 'month' | 'week') => void;
  markDateWithEntries: (date: string) => void;
  clearHighlights: () => void;
  setLoading: (loading: boolean) => void;
  navigateToToday: () => void;
  navigateToDate: (date: string) => void;
}

export type CalendarStore = CalendarState & CalendarActions;

// Entry Management State
export interface EntryState {
  entries: Entry[];
  selectedEntry: Entry | null;
  isCreating: boolean;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  lastSyncDate: string | null;
}

export interface EntryActions {
  // Entry CRUD
  addEntry: (entry: Entry) => void;
  updateEntry: (id: number, updates: Partial<Entry>) => void;
  removeEntry: (id: number) => void;
  setEntries: (entries: Entry[]) => void;

  // Selection
  selectEntry: (entry: Entry | null) => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setEditing: (editing: boolean) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Data operations
  loadEntriesForDate: (date: string) => Promise<void>;
  loadEntriesInRange: (startDate: string, endDate: string) => Promise<void>;
  createBowelMovement: (data: any) => Promise<Entry>;
  createNote: (data: any) => Promise<Entry>;

  // Utility
  setSyncDate: (date: string) => void;
  reset: () => void;
}

export type EntryStore = EntryState & EntryActions;

// Timeline UI State
export interface TimelineState {
  displayDate: string;
  entries: Entry[];
  groupByHour: boolean;
  showEmptyState: boolean;
  isRefreshing: boolean;
  scrollPosition: number;
}

export interface TimelineActions {
  setDisplayDate: (date: string) => void;
  setEntries: (entries: Entry[]) => void;
  toggleGroupByHour: () => void;
  setRefreshing: (refreshing: boolean) => void;
  setScrollPosition: (position: number) => void;
  refreshTimeline: () => Promise<void>;
}

export type TimelineStore = TimelineState & TimelineActions;

// Form State Management
export interface FormState {
  isVisible: boolean;
  mode: 'create' | 'edit';
  entryType: EntryType;
  editingId: number | null;
  initialValues: any;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface FormActions {
  showForm: (type: EntryType, mode?: 'create' | 'edit', initialValues?: any) => void;
  hideForm: () => void;
  setEditingEntry: (id: number, entry: Entry) => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  setSubmitting: (submitting: boolean) => void;
  setDirty: (dirty: boolean) => void;
  resetForm: () => void;
}

export type FormStore = FormState & FormActions;

// Export State Management
export interface ExportState {
  isExporting: boolean;
  exportProgress: number; // 0-100
  lastExportResult: ExportResult | null;
  exportOptions: ExportOptions | null;
  error: string | null;
}

export interface ExportActions {
  setExporting: (exporting: boolean) => void;
  setExportProgress: (progress: number) => void;
  setExportResult: (result: ExportResult | null) => void;
  setExportOptions: (options: ExportOptions) => void;
  setError: (error: string | null) => void;
  startExport: (options: ExportOptions) => Promise<ExportResult>;
  shareLastExport: () => Promise<void>;
  clearExportData: () => void;
}

export type ExportStore = ExportState & ExportActions;

// Application-wide UI State
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  notifications: Notification[];
  activeModal: string | null;
  bottomSheetOpen: boolean;
  keyboardVisible: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setOnlineStatus: (online: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setBottomSheetOpen: (open: boolean) => void;
  setKeyboardVisible: (visible: boolean) => void;
  setSafeAreaInsets: (insets: UIState['safeAreaInsets']) => void;
}

export type UIStore = UIState & UIActions;

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss time in ms
  persistent?: boolean; // Requires manual dismissal
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

// Filter and Search State
export interface FilterState {
  dateRange: {
    start: string | null;
    end: string | null;
  };
  entryTypes: EntryType[];
  noteCategories: NoteCategory[];
  searchQuery: string;
  sortBy: 'date' | 'type' | 'created';
  sortOrder: 'asc' | 'desc';
  isActive: boolean;
}

export interface FilterActions {
  setDateRange: (start: string | null, end: string | null) => void;
  setEntryTypes: (types: EntryType[]) => void;
  setNoteCategories: (categories: NoteCategory[]) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (field: 'date' | 'type' | 'created') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setActive: (active: boolean) => void;
  clearFilters: () => void;
  applyQuickFilter: (type: 'today' | 'week' | 'month') => void;
}

export type FilterStore = FilterState & FilterActions;

// Root Store Type (for DevTools and testing)
export interface RootState {
  calendar: CalendarStore;
  entries: EntryStore;
  timeline: TimelineStore;
  form: FormStore;
  export: ExportStore;
  ui: UIStore;
  filter: FilterStore;
}

// Store Persistence Configuration
export interface StorePersistConfig {
  name: string;
  version: number;
  migrate?: (persistedState: any, version: number) => any;
  partialize?: (state: any) => any;
  merge?: (persistedState: any, currentState: any) => any;
}

// DevTools Integration
export interface StoreDevTools {
  enabled: boolean;
  name: string;
  actionSanitizer?: (action: any) => any;
  stateSanitizer?: (state: any) => any;
}