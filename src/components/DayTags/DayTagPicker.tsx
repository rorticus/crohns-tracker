/**
 * Day Tag Picker Component
 *
 * Input field with autocomplete for selecting/creating tags.
 * Shows suggestions from existing tags, validates max tags limit.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DayTagBadge } from './DayTagBadge';
import { validateTagName } from '../../utils/tagUtils';
import {
  TAG_VALIDATION,
  TAG_TEST_IDS,
  type DayTagPickerProps,
} from '../../types/dayTag';

export function DayTagPicker({
  selectedTags,
  onTagsChange,
  availableTags,
  maxTags = TAG_VALIDATION.MAX_TAGS_PER_DAY,
  placeholder = 'Add tag...',
  disabled = false,
  testID,
}: DayTagPickerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      .slice(0, 5); // Limit to 5 suggestions
  }, [inputValue, availableTags, selectedTags]);

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    // Validate tag name
    const validation = validateTagName(trimmed);
    if (!validation.isValid) {
      // Could show error to user here
      return;
    }

    // Check max tags
    if (selectedTags.length >= maxTags) {
      // Could show error to user here
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = selectedTags.some(
      (tag) => tag.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      return;
    }

    // Add tag
    onTagsChange([...selectedTags, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      testID={testID}
    >
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
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
      )}

      {/* Input field */}
      <TextInput
        style={[
          styles.input,
          disabled && styles.inputDisabled,
          selectedTags.length >= maxTags && styles.inputMaxReached,
        ]}
        value={inputValue}
        onChangeText={handleInputChange}
        onSubmitEditing={handleSubmitEditing}
        placeholder={
          selectedTags.length >= maxTags
            ? `Maximum ${maxTags} tags reached`
            : placeholder
        }
        placeholderTextColor="#999"
        editable={!disabled && selectedTags.length < maxTags}
        testID={TAG_TEST_IDS.DAY_TAG_PICKER_INPUT}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onFocus={() => setShowSuggestions(inputValue.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {/* Tag count indicator */}
      <Text style={styles.tagCount}>
        {selectedTags.length} / {maxTags} tags
      </Text>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  inputMaxReached: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF3E0',
  },
  tagCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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
});
