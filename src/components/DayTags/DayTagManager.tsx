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
  TextInput,
} from 'react-native';
import { DayTagPicker } from './DayTagPicker';
import { useDayTagStore } from '../../stores/dayTagStore';
import { TAG_TEST_IDS, type DayTagManagerProps, type DayTag } from '../../types/dayTag';

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
    updateTagDescription,
    clearError,
  } = useDayTagStore();

  const [localTags, setLocalTags] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');

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


  // Format date for display (using local timezone)
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
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

          {/* Tag Descriptions Section */}
          {localTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tag Descriptions</Text>
              <Text style={styles.sectionDescription}>
                Add notes to describe what each tag represents (e.g., "X pills 3x daily")
              </Text>
              
              {localTags.map((tagName) => {
                const tag = allTags.find((t) => t.displayName === tagName);
                if (!tag) return null;
                
                const isEditing = editingTagId === tag.id;
                
                return (
                  <View key={tag.id} style={styles.tagDescriptionItem}>
                    <View style={styles.tagDescriptionHeader}>
                      <Text style={styles.tagDescriptionName}>{tag.displayName}</Text>
                      {!isEditing && (
                        <Pressable
                          onPress={() => {
                            setEditingTagId(tag.id);
                            setEditingDescription(tag.description || '');
                          }}
                          style={styles.editButton}
                        >
                          <Text style={styles.editButtonText}>
                            {tag.description ? 'Edit' : 'Add Note'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    
                    {isEditing ? (
                      <View style={styles.editingContainer}>
                        <TextInput
                          style={styles.descriptionInput}
                          value={editingDescription}
                          onChangeText={setEditingDescription}
                          placeholder="Enter description..."
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                        <View style={styles.editingActions}>
                          <Pressable
                            onPress={() => {
                              setEditingTagId(null);
                              setEditingDescription('');
                            }}
                            style={styles.cancelButton}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </Pressable>
                          <Pressable
                            onPress={async () => {
                              try {
                                await updateTagDescription(tag.id, editingDescription || null);
                                setEditingTagId(null);
                                setEditingDescription('');
                              } catch (error: any) {
                                Alert.alert('Error', error.message || 'Failed to save description');
                              }
                            }}
                            style={styles.saveDescButton}
                          >
                            <Text style={styles.saveDescButtonText}>Save</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : tag.description ? (
                      <Text style={styles.tagDescriptionText}>{tag.description}</Text>
                    ) : (
                      <Text style={styles.tagDescriptionPlaceholder}>No description</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

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
  tagDescriptionItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 12,
  },
  tagDescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagDescriptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  tagDescriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  tagDescriptionPlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  editingContainer: {
    marginTop: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: '#fff',
  },
  editingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  saveDescButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  saveDescButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
