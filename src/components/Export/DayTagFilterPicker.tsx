/**
 * Day Tag Filter Picker Component
 *
 * Allows users to select tags to filter exports.
 * Supports both "any" (OR) and "all" (AND) match modes.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { DayTagBadge } from '../DayTags/DayTagBadge';
import { validateTagName } from '../../utils/tagUtils';
import {
  TAG_TEST_IDS,
  type DayTag,
  type TagFilter,
} from '../../types/dayTag';

// Constants
const MAX_SUGGESTIONS = 5;
const MAX_QUICK_ADD_TAGS = 10;
const SUGGESTION_HIDE_DELAY = 200; // milliseconds

interface DayTagFilterPickerProps {
  filter: TagFilter | null;
  onFilterChange: (filter: TagFilter | null) => void;
  availableTags: DayTag[];
  testID?: string;
}

export function DayTagFilterPicker({
  filter,
  onFilterChange,
  availableTags,
  testID,
}: DayTagFilterPickerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedTags = useMemo(() => filter?.tags || [], [filter]);
  const matchMode = filter?.matchMode || 'any';

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    const lowerInput = inputValue.toLowerCase();
    return availableTags
      .filter((tag) => {
        const isAlreadySelected = selectedTags.some(
          (selected) => selected.toLowerCase() === tag.displayName.toLowerCase()
        );
        return (
          !isAlreadySelected && tag.displayName.toLowerCase().includes(lowerInput)
        );
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [inputValue, availableTags, selectedTags]);

  // Available tags that aren't already selected (for quick add)
  const availableForQuickAdd = useMemo(() => {
    return availableTags
      .filter((tag) => {
        const isAlreadySelected = selectedTags.some(
          (selected) => selected.toLowerCase() === tag.displayName.toLowerCase()
        );
        return !isAlreadySelected;
      })
      .slice(0, MAX_QUICK_ADD_TAGS);
  }, [availableTags, selectedTags]);

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    // Validate tag name
    const validation = validateTagName(trimmed);
    if (!validation.isValid) {
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = selectedTags.some(
      (tag) => tag.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      return;
    }

    // Add tag to filter
    const newTags = [...selectedTags, trimmed];
    onFilterChange({
      tags: newTags,
      matchMode,
    });
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagName: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagName);
    if (newTags.length === 0) {
      onFilterChange(null);
    } else {
      onFilterChange({
        tags: newTags,
        matchMode,
      });
    }
  };

  const handleSuggestionPress = (tagName: string) => {
    handleAddTag(tagName);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setShowSuggestions(text.length > 0);
  };

  const handleSubmitEditing = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  const toggleMatchMode = () => {
    if (selectedTags.length === 0) return;
    
    const newMode = matchMode === 'any' ? 'all' : 'any';
    onFilterChange({
      tags: selectedTags,
      matchMode: newMode,
    });
  };

  const clearFilter = () => {
    onFilterChange(null);
    setInputValue('');
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Selected tags and match mode */}
      {selectedTags.length > 0 && (
        <View style={styles.filterHeader}>
          <View style={styles.selectedTagsContainer}>
            {selectedTags.map((tag, index) => (
              <DayTagBadge
                key={`${tag}-${index}`}
                tagName={tag}
                isInherited={false}
                size="medium"
                onPress={() => handleRemoveTag(tag)}
              />
            ))}
          </View>
          <View style={styles.matchModeContainer}>
            <TouchableOpacity
              style={styles.matchModeButton}
              onPress={toggleMatchMode}
            >
              <Text style={styles.matchModeLabel}>Match:</Text>
              <Text style={styles.matchModeValue}>
                {matchMode === 'any' ? 'ANY tag' : 'ALL tags'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilter}
            >
              <Text style={styles.clearButtonText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Input field */}
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={handleInputChange}
        onSubmitEditing={handleSubmitEditing}
        placeholder="Add tag to filter..."
        placeholderTextColor="#999"
        testID={TAG_TEST_IDS.DAY_TAG_PICKER_INPUT}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onFocus={() => setShowSuggestions(inputValue.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), SUGGESTION_HIDE_DELAY)}
      />

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item.displayName)}
                testID={`${TAG_TEST_IDS.DAY_TAG_PICKER_SUGGESTION}-${item.id}`}
              >
                <Text style={styles.suggestionText}>{item.displayName}</Text>
                <Text style={styles.suggestionUsage}>
                  Used {item.usageCount} {item.usageCount === 1 ? 'time' : 'times'}
                </Text>
              </Pressable>
            )}
            style={styles.suggestionsList}
          />
        </View>
      )}

      {/* Quick Add - Show existing tags */}
      {!showSuggestions && availableForQuickAdd.length > 0 && (
        <View style={styles.quickAddContainer}>
          <Text style={styles.quickAddTitle}>Quick Add from Existing Tags:</Text>
          <View style={styles.quickAddTags}>
            {availableForQuickAdd.map((tag) => (
              <Pressable
                key={tag.id}
                style={styles.quickAddTag}
                onPress={() => handleSuggestionPress(tag.displayName)}
              >
                <Text style={styles.quickAddTagText}>{tag.displayName}</Text>
                {tag.usageCount > 0 && (
                  <Text style={styles.quickAddTagCount}>×{tag.usageCount}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  filterHeader: {
    marginBottom: 12,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  matchModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  matchModeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D47A1',
    marginRight: 6,
  },
  matchModeValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionUsage: {
    fontSize: 12,
    color: '#666',
  },
  quickAddContainer: {
    marginTop: 16,
  },
  quickAddTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  quickAddTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAddTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickAddTagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  quickAddTagCount: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
});
