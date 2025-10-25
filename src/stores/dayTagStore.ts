/**
 * Day Tag Store (Zustand)
 *
 * State management for day tags including data, loading states, and UI coordination.
 * Follows existing Zustand pattern (services handle business logic, stores handle state).
 *
 * Contract: specs/002-day-tags/contracts/DayTagStore.contract.ts
 * Tests: __tests__/stores/dayTagStore.test.ts
 */

import { create } from 'zustand';
import * as DayTagService from '../services/dayTagService';
import {
  type DayTag,
  type TagFilter,
  normalizeTagName,
} from '../types/dayTag';

/**
 * Day Tag Store State
 */
interface DayTagState {
  // Data
  allTags: DayTag[];
  tagsForDate: Record<string, string[]>;
  taggedDatesInMonth: Record<string, string[]>;
  currentFilter: TagFilter | null;
  filteredEntries: any[] | null;

  // Loading states
  isLoadingTags: boolean;
  isCreatingTag: boolean;
  isUpdatingAssociation: boolean;
  isDeletingTag: boolean;
  isApplyingFilter: boolean;

  // Error
  error: string | null;

  // Actions: Data Loading
  loadAllTags: () => Promise<void>;
  loadTagsForDate: (date: string) => Promise<string[]>;
  loadTaggedDatesInMonth: (year: number, month: number) => Promise<void>;

  // Actions: Tag Management
  createTag: (displayName: string) => Promise<DayTag>;
  deleteTag: (tagId: number) => Promise<void>;

  // Actions: Tag-Date Associations
  addTagToDay: (date: string, tagName: string) => Promise<void>;
  removeTagFromDay: (date: string, tagName: string) => Promise<void>;

  // Actions: Filtering
  applyFilter: (filter: TagFilter, startDate: string, endDate: string) => Promise<any[]>;
  clearFilter: () => void;

  // Actions: Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Actions: Cache Management
  clearCache: () => void;
  reset: () => void;

  // Selectors (Derived State)
  getTagsForDateCached: (date: string) => string[];
  hasTagsForDate: (date: string) => boolean;
  getTagNames: () => string[];
  isFilterActive: () => boolean;
}

/**
 * Day Tag Store Hook
 */
export const useDayTagStore = create<DayTagState>((set, get) => ({
  // ============================================================================
  // Initial State
  // ============================================================================

  allTags: [],
  tagsForDate: {},
  taggedDatesInMonth: {},
  currentFilter: null,
  filteredEntries: null,

  isLoadingTags: false,
  isCreatingTag: false,
  isUpdatingAssociation: false,
  isDeletingTag: false,
  isApplyingFilter: false,

  error: null,

  // ============================================================================
  // Actions: Data Loading
  // ============================================================================

  loadAllTags: async () => {
    set({ isLoadingTags: true, error: null });
    try {
      const tags = await DayTagService.getAllTags();
      set({ allTags: tags });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load tags' });
    } finally {
      set({ isLoadingTags: false });
    }
  },

  loadTagsForDate: async (date: string) => {
    try {
      const tags = await DayTagService.getTagsForDate(date);
      const tagNames = tags.map((t) => t.displayName);

      set((state) => ({
        tagsForDate: { ...state.tagsForDate, [date]: tagNames },
      }));

      return tagNames;
    } catch (error: any) {
      set({ error: error.message || `Failed to load tags for ${date}` });
      return [];
    }
  },

  loadTaggedDatesInMonth: async (year: number, month: number) => {
    try {
      const taggedDates = await DayTagService.getTaggedDatesInMonth(year, month);
      set({ taggedDatesInMonth: taggedDates });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load tagged dates' });
    }
  },

  // ============================================================================
  // Actions: Tag Management
  // ============================================================================

  createTag: async (displayName: string) => {
    set({ isCreatingTag: true, error: null });
    try {
      const tag = await DayTagService.createTag({ displayName });

      // Add to allTags if it's new (not already in the list)
      set((state) => {
        const exists = state.allTags.some((t) => t.id === tag.id);
        if (exists) {
          return { allTags: state.allTags };
        }
        // Add and re-sort by usage count
        return {
          allTags: [...state.allTags, tag].sort(
            (a, b) => b.usageCount - a.usageCount || a.displayName.localeCompare(b.displayName)
          ),
        };
      });

      return tag;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create tag' });
      throw error;
    } finally {
      set({ isCreatingTag: false });
    }
  },

  deleteTag: async (tagId: number) => {
    set({ isDeletingTag: true, error: null });
    try {
      await DayTagService.deleteTag(tagId);

      // Remove from allTags
      set((state) => ({
        allTags: state.allTags.filter((t) => t.id !== tagId),
        // Clear caches that might reference this tag
        taggedDatesInMonth: {},
        filteredEntries: null,
      }));

      // Clear current filter if it uses this deleted tag
      const deletedTag = get().allTags.find((t) => t.id === tagId);
      if (deletedTag && get().currentFilter) {
        const normalizedDeletedTag = normalizeTagName(deletedTag.displayName);
        const filterUsesTag = get().currentFilter!.tags.some(
          (t) => normalizeTagName(t) === normalizedDeletedTag
        );
        if (filterUsesTag) {
          set({ currentFilter: null, filteredEntries: null });
        }
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete tag' });
      throw error;
    } finally {
      set({ isDeletingTag: false });
    }
  },

  // ============================================================================
  // Actions: Tag-Date Associations
  // ============================================================================

  addTagToDay: async (date: string, tagName: string) => {
    set({ isUpdatingAssociation: true, error: null });
    try {
      // Create tag if it doesn't exist (or get existing)
      const tag = await get().createTag(tagName);

      // Add tag to day
      await DayTagService.addTagToDay(tag.id, date);

      // Update state
      set((state) => {
        const currentTags = state.tagsForDate[date] || [];

        // Update tagsForDate
        const newTagsForDate = {
          ...state.tagsForDate,
          [date]: [...currentTags, tag.displayName],
        };

        // Update taggedDatesInMonth if this date is in current month
        const newTaggedDatesInMonth = { ...state.taggedDatesInMonth };
        if (newTaggedDatesInMonth[date]) {
          newTaggedDatesInMonth[date] = [...newTaggedDatesInMonth[date], tag.displayName];
        }

        // Increment usage count in allTags
        const newAllTags = state.allTags.map((t) =>
          t.id === tag.id ? { ...t, usageCount: t.usageCount + 1 } : t
        );

        return {
          tagsForDate: newTagsForDate,
          taggedDatesInMonth: newTaggedDatesInMonth,
          allTags: newAllTags,
          filteredEntries: null, // Clear cache as data changed
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add tag to day' });
      throw error;
    } finally {
      set({ isUpdatingAssociation: false });
    }
  },

  removeTagFromDay: async (date: string, tagName: string) => {
    set({ isUpdatingAssociation: true, error: null });
    try {
      // Find tag by normalized name
      const normalized = normalizeTagName(tagName);
      const tag = get().allTags.find((t) => t.name === normalized);

      if (!tag) {
        throw new Error(`Tag "${tagName}" not found`);
      }

      // Remove tag from day
      await DayTagService.removeTagFromDay(tag.id, date);

      // Update state
      set((state) => {
        // Update tagsForDate
        const newTagsForDate = {
          ...state.tagsForDate,
          [date]: (state.tagsForDate[date] || []).filter((t) => normalizeTagName(t) !== normalized),
        };

        // Update taggedDatesInMonth if this date is in current month
        const newTaggedDatesInMonth = { ...state.taggedDatesInMonth };
        if (newTaggedDatesInMonth[date]) {
          newTaggedDatesInMonth[date] = newTaggedDatesInMonth[date].filter(
            (t) => normalizeTagName(t) !== normalized
          );
          // Remove date entry if no tags remain
          if (newTaggedDatesInMonth[date].length === 0) {
            delete newTaggedDatesInMonth[date];
          }
        }

        // Decrement usage count in allTags
        const newAllTags = state.allTags.map((t) =>
          t.id === tag.id ? { ...t, usageCount: Math.max(0, t.usageCount - 1) } : t
        );

        return {
          tagsForDate: newTagsForDate,
          taggedDatesInMonth: newTaggedDatesInMonth,
          allTags: newAllTags,
          filteredEntries: null, // Clear cache as data changed
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove tag from day' });
      throw error;
    } finally {
      set({ isUpdatingAssociation: false });
    }
  },

  // ============================================================================
  // Actions: Filtering
  // ============================================================================

  applyFilter: async (filter: TagFilter, startDate: string, endDate: string) => {
    set({ isApplyingFilter: true, error: null, currentFilter: filter });
    try {
      const entries = await DayTagService.getEntriesByTags(filter, startDate, endDate);
      set({ filteredEntries: entries });
      return entries;
    } catch (error: any) {
      set({ error: error.message || 'Failed to apply filter' });
      return [];
    } finally {
      set({ isApplyingFilter: false });
    }
  },

  clearFilter: () => {
    set({ currentFilter: null, filteredEntries: null });
  },

  // ============================================================================
  // Actions: Error Handling
  // ============================================================================

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // ============================================================================
  // Actions: Cache Management
  // ============================================================================

  clearCache: () => {
    set({ taggedDatesInMonth: {}, filteredEntries: null });
  },

  reset: () => {
    set({
      allTags: [],
      tagsForDate: {},
      taggedDatesInMonth: {},
      currentFilter: null,
      filteredEntries: null,
      isLoadingTags: false,
      isCreatingTag: false,
      isUpdatingAssociation: false,
      isDeletingTag: false,
      isApplyingFilter: false,
      error: null,
    });
  },

  // ============================================================================
  // Selectors (Derived State)
  // ============================================================================

  getTagsForDateCached: (date: string) => {
    return get().tagsForDate[date] || [];
  },

  hasTagsForDate: (date: string) => {
    const tags = get().tagsForDate[date];
    return tags !== undefined && tags.length > 0;
  },

  getTagNames: () => {
    return get().allTags.map((tag) => tag.displayName);
  },

  isFilterActive: () => {
    return get().currentFilter !== null;
  },
}));
