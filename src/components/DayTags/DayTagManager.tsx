/**
 * Day Tag Manager Modal
 *
 * Modal for managing tags for a specific date.
 * Allows adding, viewing, and removing tags from a day.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { DayTagPicker } from './DayTagPicker';
import { useDayTagStore } from '../../stores/dayTagStore';
import { TAG_TEST_IDS, type DayTagManagerProps } from '../../types/dayTag';

export function DayTagManager({
  date,
  visible,
  onClose,
  onTagsChanged,
}: DayTagManagerProps) {
  const {
    allTags,
    tagsForDate,
    isLoadingTags,
    isUpdatingAssociation,
    error,
    loadAllTags,
    loadTagsForDate,
    addTagToDay,
    removeTagFromDay,
    clearError,
  } = useDayTagStore();

  const [localTags, setLocalTags] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadAllTags();
      loadTagsForDate(date).then((tags) => {
        setLocalTags(tags);
        setHasChanges(false);
      });
    }
  }, [visible, date]);

  // Update local tags when store updates
  useEffect(() => {
    if (visible && tagsForDate[date]) {
      setLocalTags(tagsForDate[date]);
    }
  }, [tagsForDate, date, visible]);

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    // Determine which tags were added and which were removed
    const currentTags = tagsForDate[date] || [];
    const tagsToAdd = localTags.filter((tag) => !currentTags.includes(tag));
    const tagsToRemove = currentTags.filter((tag) => !localTags.includes(tag));

    try {
      // Add new tags
      for (const tag of tagsToAdd) {
        await addTagToDay(date, tag);
      }

      // Remove deleted tags
      for (const tag of tagsToRemove) {
        await removeTagFromDay(date, tag);
      }

      // Notify parent of changes
      if (onTagsChanged) {
        onTagsChanged(localTags);
      }

      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save tags');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setLocalTags(tagsForDate[date] || []);
              setHasChanges(false);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setLocalTags(newTags);
    setHasChanges(true);
  };


  // Format date for display
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
      testID={TAG_TEST_IDS.DAY_TAG_MANAGER}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleCancel}
            style={styles.headerButton}
            testID={TAG_TEST_IDS.DAY_TAG_MANAGER_CLOSE}
          >
            <Text style={styles.headerButtonText}>Cancel</Text>
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Day Tags</Text>
            <Text style={styles.headerSubtitle}>{formatDate(date)}</Text>
          </View>

          <Pressable
            onPress={handleSave}
            style={styles.headerButton}
            disabled={isUpdatingAssociation}
            testID={TAG_TEST_IDS.DAY_TAG_MANAGER_SAVE}
          >
            {isUpdatingAssociation ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
            )}
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={clearError}>
                <Text style={styles.errorDismiss}>Dismiss</Text>
              </Pressable>
            </View>
          )}

          {/* Tag picker - shows selected tags and quick add */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Manage Tags ({localTags.length})
            </Text>
            <Text style={styles.sectionDescription}>
              {localTags.length === 0
                ? 'Tap existing tags below to add them, or type to create new ones.'
                : 'Tap a tag to remove it. Add more by tapping below or typing new ones.'}
            </Text>

            {isLoadingTags ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <DayTagPicker
                selectedTags={localTags}
                onTagsChange={handleTagsChange}
                availableTags={allTags}
                placeholder="Type to create new tag..."
              />
            )}
          </View>

          {/* Help text */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>About Day Tags</Text>
            <Text style={styles.helpText}>
              • Tags help you categorize days with context (e.g., "vacation", "new
              medicine")
            </Text>
            <Text style={styles.helpText}>
              • All entries on this day will automatically inherit these tags
            </Text>
            <Text style={styles.helpText}>
              • You can filter your timeline by tags to find patterns
            </Text>
            <Text style={styles.helpText}>• Maximum 10 tags per day</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
    minWidth: 70,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    color: '#c00',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});
