import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimelineEntry } from './TimelineComponent';

interface TimelineItemProps {
  entry: TimelineEntry;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'food':
      return '🍽️';
    case 'exercise':
      return '🏃';
    case 'medication':
      return '💊';
    case 'other':
    default:
      return '📝';
  }
};

const getConsistencyDescription = (consistency: number): string => {
  const descriptions: Record<number, string> = {
    1: 'Separate hard lumps',
    2: 'Sausage-shaped but lumpy',
    3: 'Like a sausage with cracks',
    4: 'Like a sausage, smooth',
    5: 'Soft blobs',
    6: 'Fluffy pieces',
    7: 'Watery',
  };
  return descriptions[consistency] || 'Unknown';
};

const getUrgencyDescription = (urgency: number): string => {
  const descriptions: Record<number, string> = {
    1: 'No urgency',
    2: 'Mild urgency',
    3: 'Moderate urgency',
    4: 'Extreme urgency',
  };
  return descriptions[urgency] || 'Unknown';
};

export function TimelineItem({ entry, onPress, onEdit, onDelete }: TimelineItemProps) {
  const isBowelMovement = entry.type === 'bowel_movement';
  const isNote = entry.type === 'note';

  const renderBowelMovementContent = () => {
    if (!entry.bowelMovement) return null;

    return (
      <>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Consistency:</Text>
          <Text style={styles.detailValue}>
            {entry.bowelMovement.consistency} - {getConsistencyDescription(entry.bowelMovement.consistency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Urgency:</Text>
          <Text style={styles.detailValue}>
            {entry.bowelMovement.urgency} - {getUrgencyDescription(entry.bowelMovement.urgency)}
          </Text>
        </View>
        {entry.bowelMovement.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{entry.bowelMovement.notes}</Text>
          </View>
        )}
      </>
    );
  };

  const renderNoteContent = () => {
    if (!entry.note) return null;

    return (
      <>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(entry.note.category)}
          </Text>
          <Text style={styles.categoryText}>{entry.note.category}</Text>
        </View>
        <Text style={styles.noteContent}>{entry.note.content}</Text>
        {entry.note.tags && (
          <View style={styles.tagsContainer}>
            {entry.note.tags.split(',').map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      testID="timeline-item"
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.timelineMarker}>
        <View style={[styles.dot, isBowelMovement ? styles.bowelDot : styles.noteDot]} />
        <View style={styles.line} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.time}>{entry.time}</Text>
            <Text style={styles.type}>
              {isBowelMovement ? '🚽 Bowel Movement' : '📝 Note'}
            </Text>
          </View>
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={styles.actionButton}
                  accessibilityLabel="Edit entry"
                  accessibilityRole="button"
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={styles.actionButton}
                  accessibilityLabel="Delete entry"
                  accessibilityRole="button"
                >
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.details}>
          {isBowelMovement && renderBowelMovementContent()}
          {isNote && renderNoteContent()}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineMarker: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  bowelDot: {
    backgroundColor: '#007AFF',
  },
  noteDot: {
    backgroundColor: '#34C759',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E5EA',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    minWidth: 90,
  },
  detailValue: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  notesContainer: {
    marginTop: 4,
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontStyle: 'italic',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  noteContent: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1C1C1E',
  },
});
