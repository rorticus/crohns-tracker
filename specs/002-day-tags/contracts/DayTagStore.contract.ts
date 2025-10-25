/**
 * Day Tag Store Contract (Zustand)
 *
 * Defines the state shape and actions for day tag state management.
 * This contract specifies the store interface following existing Zustand patterns
 * (entryStore.ts, exportStore.ts).
 *
 * Implementation: src/stores/dayTagStore.ts
 * Tests: __tests__/stores/dayTagStore.test.ts
 */

import type { DayTag, DayTagAssociation, TagFilter } from '../types/dayTag';
import type { CombinedEntry } from '../types/entry';

/**
 * Day Tag Store Interface
 *
 * Zustand store for managing day tag state, loading states, and UI coordination.
 * Follows existing pattern: services handle business logic, stores handle state + async coordination.
 */
export interface DayTagStore {

  // ============================================================================
  // State: Data
  // ============================================================================

  /**
   * All unique tags (for autocomplete, picker)
   * Loaded once on app start or when tags are created/deleted
   * Sorted by usageCount DESC, displayName ASC
   */
  allTags: DayTag[];

  /**
   * Tags for a specific date (currently selected or being edited)
   * Key: date string (YYYY-MM-DD)
   * Value: array of tag displayNames
   */
  tagsForDate: Record<string, string[]>;

  /**
   * Tagged dates for current calendar month
   * Used for marking calendar days
   * Key: date string (YYYY-MM-DD)
   * Value: array of tag displayNames
   * Cleared when month changes
   */
  taggedDatesInMonth: Record<string, string[]>;

  /**
   * Currently active tag filter (for timeline/entry views)
   * null means no filter active (show all entries)
   */
  currentFilter: TagFilter | null;

  /**
   * Filtered entries (cached result of applying currentFilter)
   * null means no filter active or filter not yet applied
   * Cleared when filter changes or entries are modified
   */
  filteredEntries: CombinedEntry[] | null;

  // ============================================================================
  // State: Loading & Error
  // ============================================================================

  /**
   * True when loading all tags (initial load)
   */
  isLoadingTags: boolean;

  /**
   * True when creating a new tag
   */
  isCreatingTag: boolean;

  /**
   * True when adding/removing tag from date
   */
  isUpdatingAssociation: boolean;

  /**
   * True when deleting a tag
   */
  isDeletingTag: boolean;

  /**
   * True when applying filter (fetching filtered entries)
   */
  isApplyingFilter: boolean;

  /**
   * Error message for display to user
   * null means no error
   */
  error: string | null;

  // ============================================================================
  // Actions: Data Loading
  // ============================================================================

  /**
   * Load all unique tags from database
   * Called on app start or after tag create/delete
   *
   * @returns Promise<void>
   *
   * Side effects:
   * - Sets isLoadingTags = true
   * - Calls DayTagService.getAllTags()
   * - Updates allTags state
   * - Sets isLoadingTags = false
   * - Sets error on failure
   *
   * Example:
   * ```typescript
   * const { loadAllTags } = useDayTagStore();
   * await loadAllTags(); // allTags now populated
   * ```
   */
  loadAllTags: () => Promise<void>;

  /**
   * Load tags for a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns Promise<string[]> - Tag displayNames for this date
   *
   * Side effects:
   * - Calls DayTagService.getTagsForDate(date)
   * - Updates tagsForDate[date]
   * - Returns tag displayNames
   * - Sets error on failure
   *
   * Example:
   * ```typescript
   * const { loadTagsForDate } = useDayTagStore();
   * const tags = await loadTagsForDate('2025-10-25');
   * // Returns: ['Vacation', 'New Medicine']
   * ```
   */
  loadTagsForDate: (date: string) => Promise<string[]>;

  /**
   * Load tagged dates for a calendar month
   *
   * @param year - Year (e.g., 2025)
   * @param month - Month (1-12)
   * @returns Promise<void>
   *
   * Side effects:
   * - Calls DayTagService.getTaggedDatesInMonth(year, month)
   * - Replaces taggedDatesInMonth state (clears previous month)
   * - Sets error on failure
   *
   * Example:
   * ```typescript
   * const { loadTaggedDatesInMonth } = useDayTagStore();
   * await loadTaggedDatesInMonth(2025, 10);
   * // taggedDatesInMonth now has October's tagged dates
   * ```
   */
  loadTaggedDatesInMonth: (year: number, month: number) => Promise<void>;

  // ============================================================================
  // Actions: Tag Management
  // ============================================================================

  /**
   * Create a new tag (or get existing if normalized name matches)
   *
   * @param displayName - User's tag name (preserves capitalization)
   * @returns Promise<DayTag> - Created or existing tag
   *
   * Side effects:
   * - Sets isCreatingTag = true
   * - Calls DayTagService.createTag({ displayName })
   * - Adds tag to allTags if new
   * - Sets isCreatingTag = false
   * - Sets error on validation failure
   *
   * Example:
   * ```typescript
   * const { createTag } = useDayTagStore();
   * const tag = await createTag('Vacation');
   * // Returns: { id: 1, name: 'vacation', displayName: 'Vacation', ... }
   * ```
   */
  createTag: (displayName: string) => Promise<DayTag>;

  /**
   * Delete a tag by ID
   *
   * @param tagId - Tag ID to delete
   * @returns Promise<void>
   *
   * Side effects:
   * - Sets isDeletingTag = true
   * - Calls DayTagService.deleteTag(tagId)
   * - Removes tag from allTags
   * - Clears taggedDatesInMonth (refresh needed)
   * - Clears filteredEntries if currentFilter uses this tag
   * - Sets isDeletingTag = false
   * - Sets error on failure
   *
   * Example:
   * ```typescript
   * const { deleteTag } = useDayTagStore();
   * await deleteTag(1); // Tag and associations deleted
   * ```
   */
  deleteTag: (tagId: number) => Promise<void>;

  // ============================================================================
  // Actions: Tag-Date Associations
  // ============================================================================

  /**
   * Add a tag to a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @param tagName - Tag displayName to add (will be normalized)
   * @returns Promise<void>
   *
   * Side effects:
   * - Sets isUpdatingAssociation = true
   * - Creates tag if it doesn't exist (calls createTag)
   * - Calls DayTagService.addTagToDay(tagId, date)
   * - Updates tagsForDate[date] with new tag
   * - Updates taggedDatesInMonth if date is in current month
   * - Increments tag's usageCount in allTags
   * - Clears filteredEntries (may be outdated)
   * - Sets isUpdatingAssociation = false
   * - Sets error on failure (max tags, duplicate, invalid date)
   *
   * Example:
   * ```typescript
   * const { addTagToDay } = useDayTagStore();
   * await addTagToDay('2025-10-25', 'Vacation');
   * // 'Vacation' tag now applied to Oct 25
   * ```
   */
  addTagToDay: (date: string, tagName: string) => Promise<void>;

  /**
   * Remove a tag from a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @param tagName - Tag displayName to remove (will be normalized)
   * @returns Promise<void>
   *
   * Side effects:
   * - Sets isUpdatingAssociation = true
   * - Finds tag by normalized name
   * - Calls DayTagService.removeTagFromDay(tagId, date)
   * - Removes tag from tagsForDate[date]
   * - Updates taggedDatesInMonth if date is in current month
   * - Decrements tag's usageCount in allTags
   * - Clears filteredEntries (may be outdated)
   * - Sets isUpdatingAssociation = false
   * - Sets error on failure
   *
   * Example:
   * ```typescript
   * const { removeTagFromDay } = useDayTagStore();
   * await removeTagFromDay('2025-10-25', 'Vacation');
   * // 'Vacation' tag removed from Oct 25
   * ```
   */
  removeTagFromDay: (date: string, tagName: string) => Promise<void>;

  // ============================================================================
  // Actions: Filtering
  // ============================================================================

  /**
   * Apply a tag filter to entries
   *
   * @param filter - Tag filter with tags and match mode
   * @param startDate - Range start (YYYY-MM-DD)
   * @param endDate - Range end (YYYY-MM-DD)
   * @returns Promise<CombinedEntry[]> - Filtered entries
   *
   * Side effects:
   * - Sets isApplyingFilter = true
   * - Sets currentFilter = filter
   * - Calls DayTagService.getEntriesByTags(filter, startDate, endDate)
   * - Updates filteredEntries
   * - Sets isApplyingFilter = false
   * - Sets error on failure
   * - Returns filtered entries
   *
   * Example:
   * ```typescript
   * const { applyFilter } = useDayTagStore();
   * const entries = await applyFilter(
   *   { tags: ['vacation', 'new medicine'], matchMode: 'all' },
   *   '2025-10-01',
   *   '2025-10-31'
   * );
   * // Returns entries from dates with both tags
   * ```
   */
  applyFilter: (filter: TagFilter, startDate: string, endDate: string) => Promise<CombinedEntry[]>;

  /**
   * Clear the current filter
   *
   * @returns void (synchronous)
   *
   * Side effects:
   * - Sets currentFilter = null
   * - Sets filteredEntries = null
   * - Timeline/entry views return to showing all entries
   *
   * Example:
   * ```typescript
   * const { clearFilter } = useDayTagStore();
   * clearFilter(); // Filter removed, all entries visible
   * ```
   */
  clearFilter: () => void;

  // ============================================================================
  // Actions: Error Handling
  // ============================================================================

  /**
   * Set an error message
   *
   * @param error - Error message or null to clear
   * @returns void (synchronous)
   *
   * Example:
   * ```typescript
   * const { setError } = useDayTagStore();
   * setError('Failed to load tags');
   * ```
   */
  setError: (error: string | null) => void;

  /**
   * Clear the current error
   *
   * @returns void (synchronous)
   *
   * Example:
   * ```typescript
   * const { clearError } = useDayTagStore();
   * clearError();
   * ```
   */
  clearError: () => void;

  // ============================================================================
  // Actions: Cache Management
  // ============================================================================

  /**
   * Clear cached data (for month change or manual refresh)
   *
   * @returns void (synchronous)
   *
   * Side effects:
   * - Clears taggedDatesInMonth
   * - Clears filteredEntries
   * - Does NOT clear allTags (persistent across months)
   *
   * Example:
   * ```typescript
   * const { clearCache } = useDayTagStore();
   * clearCache(); // Month changed, need to reload
   * ```
   */
  clearCache: () => void;

  /**
   * Reset store to initial state
   *
   * @returns void (synchronous)
   *
   * Side effects:
   * - Clears all data (allTags, tagsForDate, taggedDatesInMonth, filteredEntries)
   * - Clears currentFilter
   * - Resets all loading states to false
   * - Clears error
   *
   * Example:
   * ```typescript
   * const { reset } = useDayTagStore();
   * reset(); // Full reset (e.g., logout, test cleanup)
   * ```
   */
  reset: () => void;

  // ============================================================================
  // Selectors (Derived State)
  // ============================================================================

  /**
   * Get tags for a specific date (from cache or empty array)
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns string[] - Tag displayNames for this date
   *
   * Note: This is a selector, not an action. Returns cached data, doesn't fetch.
   *
   * Example:
   * ```typescript
   * const { getTagsForDateCached } = useDayTagStore();
   * const tags = getTagsForDateCached('2025-10-25');
   * // Returns: ['Vacation', 'New Medicine'] or [] if not cached
   * ```
   */
  getTagsForDateCached: (date: string) => string[];

  /**
   * Check if a specific date has any tags (from cache)
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns boolean - True if date has tags
   *
   * Note: This is a selector, returns cached data only.
   *
   * Example:
   * ```typescript
   * const { hasTagsForDate } = useDayTagStore();
   * const hasTags = hasTagsForDate('2025-10-25'); // true or false
   * ```
   */
  hasTagsForDate: (date: string) => boolean;

  /**
   * Get all unique tag names (normalized) for autocomplete
   *
   * @returns string[] - Tag displayNames sorted by usage
   *
   * Note: This is a selector, derived from allTags.
   *
   * Example:
   * ```typescript
   * const { getTagNames } = useDayTagStore();
   * const names = getTagNames();
   * // Returns: ['Vacation', 'New Medicine', 'High Stress']
   * ```
   */
  getTagNames: () => string[];

  /**
   * Check if any filter is currently active
   *
   * @returns boolean - True if currentFilter is not null
   *
   * Note: This is a selector.
   *
   * Example:
   * ```typescript
   * const { isFilterActive } = useDayTagStore();
   * const active = isFilterActive(); // true or false
   * ```
   */
  isFilterActive: () => boolean;
}

// ============================================================================
// Usage Patterns
// ============================================================================

/**
 * Component usage examples:
 *
 * 1. Calendar screen - show tagged days:
 * ```typescript
 * const { taggedDatesInMonth, loadTaggedDatesInMonth } = useDayTagStore();
 *
 * useEffect(() => {
 *   loadTaggedDatesInMonth(2025, 10);
 * }, [month]);
 *
 * const markedDates = Object.entries(taggedDatesInMonth).reduce((acc, [date, tags]) => {
 *   acc[date] = {
 *     marked: true,
 *     dots: [{ key: 'tag', color: '#FF9500' }],
 *     accessibilityLabel: `${tags.length} tags: ${tags.join(', ')}`
 *   };
 *   return acc;
 * }, {});
 * ```
 *
 * 2. Day tag manager modal - add/remove tags:
 * ```typescript
 * const { tagsForDate, addTagToDay, removeTagFromDay, loadTagsForDate } = useDayTagStore();
 *
 * useEffect(() => {
 *   loadTagsForDate(selectedDate);
 * }, [selectedDate]);
 *
 * const handleAddTag = async (tagName: string) => {
 *   await addTagToDay(selectedDate, tagName);
 * };
 *
 * const handleRemoveTag = async (tagName: string) => {
 *   await removeTagFromDay(selectedDate, tagName);
 * };
 * ```
 *
 * 3. Timeline screen - filter by tag:
 * ```typescript
 * const { applyFilter, clearFilter, filteredEntries, isApplyingFilter } = useDayTagStore();
 *
 * const handleFilterByTag = async (tagName: string) => {
 *   await applyFilter(
 *     { tags: [tagName], matchMode: 'any' },
 *     startDate,
 *     endDate
 *   );
 * };
 *
 * const displayedEntries = filteredEntries || allEntries;
 * ```
 *
 * 4. Tag picker - autocomplete:
 * ```typescript
 * const { allTags, getTagNames, createTag } = useDayTagStore();
 *
 * const suggestions = getTagNames().filter(name =>
 *   name.toLowerCase().includes(searchText.toLowerCase())
 * );
 *
 * const handleCreateTag = async (newTagName: string) => {
 *   const tag = await createTag(newTagName);
 *   // Tag created, can now be used
 * };
 * ```
 */

// ============================================================================
// State Initialization
// ============================================================================

/**
 * Initial state for the store:
 *
 * ```typescript
 * const initialState: Partial<DayTagStore> = {
 *   allTags: [],
 *   tagsForDate: {},
 *   taggedDatesInMonth: {},
 *   currentFilter: null,
 *   filteredEntries: null,
 *   isLoadingTags: false,
 *   isCreatingTag: false,
 *   isUpdatingAssociation: false,
 *   isDeletingTag: false,
 *   isApplyingFilter: false,
 *   error: null,
 * };
 * ```
 */

// ============================================================================
// Performance Considerations
// ============================================================================

/**
 * Store optimization strategies:
 *
 * 1. Selective caching:
 *    - allTags: Cached indefinitely (small dataset, <100 items)
 *    - taggedDatesInMonth: Cached for current month only (cleared on month change)
 *    - filteredEntries: Cached until filter changes or data modified
 *
 * 2. Lazy loading:
 *    - allTags loaded on first use, not app start
 *    - taggedDatesInMonth loaded when calendar view is displayed
 *    - tagsForDate loaded on-demand when date is selected
 *
 * 3. Debouncing:
 *    - Tag autocomplete: Debounce search input (300ms)
 *    - Filter application: Debounce filter changes if using multi-select
 *
 * 4. Batching:
 *    - Bulk tag additions: Use transaction for multiple addTagToDay calls
 *    - Calendar month load: Single query for all tagged dates in month
 *
 * 5. Memory limits:
 *    - Clear taggedDatesInMonth on month change (don't accumulate months)
 *    - Limit filteredEntries to 1000 entries (paginate if needed)
 */

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Error handling pattern:
 *
 * ```typescript
 * const addTagToDay = async (date: string, tagName: string) => {
 *   set({ isUpdatingAssociation: true, error: null });
 *   try {
 *     // Validation
 *     const validation = DayTagService.validateTagName(tagName);
 *     if (!validation.isValid) {
 *       throw new Error(validation.errors[0].message);
 *     }
 *
 *     // Business logic
 *     const tag = await get().createTag(tagName);
 *     await DayTagService.addTagToDay(tag.id, date);
 *
 *     // Update state
 *     set(state => ({
 *       tagsForDate: {
 *         ...state.tagsForDate,
 *         [date]: [...(state.tagsForDate[date] || []), tag.displayName]
 *       }
 *     }));
 *   } catch (error) {
 *     set({ error: error.message });
 *     throw error; // Re-throw for UI to handle (e.g., Alert)
 *   } finally {
 *     set({ isUpdatingAssociation: false });
 *   }
 * };
 * ```
 */

// ============================================================================
// Testing Requirements
// ============================================================================

/**
 * Store testing strategy:
 *
 * 1. State updates:
 *    - Test each action updates correct state
 *    - Test loading states set/cleared correctly
 *    - Test error states set on failure
 *
 * 2. Service integration:
 *    - Mock DayTagService methods
 *    - Verify service called with correct params
 *    - Test error handling when service throws
 *
 * 3. Derived state (selectors):
 *    - Test selectors return correct values
 *    - Test selectors with empty state
 *
 * 4. State consistency:
 *    - Test cache invalidation (clearCache, reset)
 *    - Test filtered entries cleared when filter changes
 *    - Test usageCount updates on add/remove
 *
 * Example test:
 * ```typescript
 * describe('useDayTagStore', () => {
 *   it('adds tag to day and updates state', async () => {
 *     const { result } = renderHook(() => useDayTagStore());
 *
 *     await act(async () => {
 *       await result.current.addTagToDay('2025-10-25', 'Vacation');
 *     });
 *
 *     expect(result.current.tagsForDate['2025-10-25']).toContain('Vacation');
 *     expect(result.current.isUpdatingAssociation).toBe(false);
 *   });
 * });
 * ```
 */
