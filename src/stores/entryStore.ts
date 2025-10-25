import { create } from 'zustand';
import { EntryService } from '@/services/entryService';
import {
  CombinedEntry,
  CreateBowelMovementInput,
  CreateNoteInput,
  BowelMovementEntry,
  NoteEntry,
} from '@/types/entry';

interface EntryState {
  // Data
  entries: CombinedEntry[];
  selectedEntry: CombinedEntry | null;
  selectedDate: string;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedEntry: (entry: CombinedEntry | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Data operations
  loadEntriesForDate: (date: string) => Promise<void>;
  createBowelMovement: (input: CreateBowelMovementInput) => Promise<BowelMovementEntry>;
  createNote: (input: CreateNoteInput) => Promise<NoteEntry>;
  updateEntry: (entryId: number, updates: any) => Promise<CombinedEntry>;
  deleteEntry: (entryId: number) => Promise<void>;
  refreshEntries: () => Promise<void>;

  // Utility actions
  reset: () => void;
  getEntriesForCurrentDate: () => CombinedEntry[];
}

const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const useEntryStore = create<EntryState>((set, get) => ({
  // Initial state
  entries: [],
  selectedEntry: null,
  selectedDate: getCurrentDate(),
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  // Basic setters
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    // Auto-load entries for the new date
    get().loadEntriesForDate(date);
  },

  setSelectedEntry: (entry: CombinedEntry | null) => {
    set({ selectedEntry: entry });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // Load entries for a specific date
  loadEntriesForDate: async (date: string) => {
    set({ isLoading: true, error: null });

    try {
      const entries = await EntryService.getEntriesForDate(date);
      set({
        entries,
        selectedDate: date,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load entries:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load entries',
        isLoading: false,
      });
    }
  },

  // Create bowel movement entry
  createBowelMovement: async (input: CreateBowelMovementInput): Promise<BowelMovementEntry> => {
    set({ isCreating: true, error: null });

    try {
      const newEntry = await EntryService.createBowelMovement(input);

      // Add to entries if it's for the currently selected date
      const currentState = get();
      if (input.date === currentState.selectedDate) {
        const updatedEntries = [...currentState.entries, newEntry];
        // Sort by timestamp
        updatedEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        set({ entries: updatedEntries });
      }

      set({ isCreating: false });
      return newEntry;
    } catch (error) {
      console.error('Failed to create bowel movement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create entry';
      set({
        error: errorMessage,
        isCreating: false,
      });
      throw error;
    }
  },

  // Create note entry
  createNote: async (input: CreateNoteInput): Promise<NoteEntry> => {
    set({ isCreating: true, error: null });

    try {
      const newEntry = await EntryService.createNote(input);

      // Add to entries if it's for the currently selected date
      const currentState = get();
      if (input.date === currentState.selectedDate) {
        const updatedEntries = [...currentState.entries, newEntry];
        // Sort by timestamp
        updatedEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        set({ entries: updatedEntries });
      }

      set({ isCreating: false });
      return newEntry;
    } catch (error) {
      console.error('Failed to create note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
      set({
        error: errorMessage,
        isCreating: false,
      });
      throw error;
    }
  },

  // Update entry
  updateEntry: async (entryId: number, updates: any): Promise<CombinedEntry> => {
    set({ isUpdating: true, error: null });

    try {
      // Find the entry to determine its type
      const currentEntry = get().entries.find(e => e.id === entryId);
      if (!currentEntry) {
        throw new Error('Entry not found');
      }

      let updatedEntry: CombinedEntry;

      if (currentEntry.type === 'bowel_movement') {
        updatedEntry = await EntryService.updateBowelMovement(entryId, updates);
      } else {
        // Note update would go here when implemented
        throw new Error('Note updates not yet implemented');
      }

      // Update the entry in the current entries array
      const currentState = get();
      const updatedEntries = currentState.entries.map(entry =>
        entry.id === entryId ? updatedEntry : entry
      );

      set({
        entries: updatedEntries,
        selectedEntry: updatedEntry,
        isUpdating: false,
      });

      return updatedEntry;
    } catch (error) {
      console.error('Failed to update entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update entry';
      set({
        error: errorMessage,
        isUpdating: false,
      });
      throw error;
    }
  },

  // Delete entry
  deleteEntry: async (entryId: number): Promise<void> => {
    set({ isDeleting: true, error: null });

    try {
      await EntryService.deleteEntry(entryId);

      // Remove from entries array
      const currentState = get();
      const updatedEntries = currentState.entries.filter(entry => entry.id !== entryId);

      set({
        entries: updatedEntries,
        selectedEntry: currentState.selectedEntry?.id === entryId ? null : currentState.selectedEntry,
        isDeleting: false,
      });
    } catch (error) {
      console.error('Failed to delete entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete entry';
      set({
        error: errorMessage,
        isDeleting: false,
      });
      throw error;
    }
  },

  // Refresh entries for current date
  refreshEntries: async (): Promise<void> => {
    const currentDate = get().selectedDate;
    await get().loadEntriesForDate(currentDate);
  },

  // Reset store to initial state
  reset: () => {
    set({
      entries: [],
      selectedEntry: null,
      selectedDate: getCurrentDate(),
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
    });
  },

  // Get entries for current selected date
  getEntriesForCurrentDate: (): CombinedEntry[] => {
    const state = get();
    return state.entries.filter(entry => entry.date === state.selectedDate);
  },
}));

// Utility hook for common operations
export const useEntryOperations = () => {
  const store = useEntryStore();

  const createTodaysBowelMovement = async (
    consistency: number,
    urgency: number,
    notes?: string
  ) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);

    return store.createBowelMovement({
      date,
      time,
      consistency: consistency as any,
      urgency: urgency as any,
      notes,
    });
  };

  const createTodaysNote = async (
    category: 'food' | 'exercise' | 'medication' | 'other',
    content: string,
    tags?: string
  ) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);

    return store.createNote({
      date,
      time,
      category,
      content,
      tags,
    });
  };

  return {
    createTodaysBowelMovement,
    createTodaysNote,
    ...store,
  };
};