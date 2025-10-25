import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Entry, BowelMovement, Note } from '@/types/entry';
import { TimelineItem } from './TimelineItem';

export interface TimelineEntry extends Entry {
  bowelMovement?: BowelMovement;
  note?: Note;
}

interface TimelineComponentProps {
  entries: TimelineEntry[];
  onEntryPress?: (entry: TimelineEntry) => void;
  onEntryEdit?: (entry: TimelineEntry) => void;
  onEntryDelete?: (entryId: number) => void;
}

export function TimelineComponent({
  entries,
  onEntryPress,
  onEntryEdit,
  onEntryDelete,
}: TimelineComponentProps) {
  // Sort entries chronologically (earliest first)
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const renderItem = ({ item }: { item: TimelineEntry }) => (
    <TimelineItem
      entry={item}
      onPress={onEntryPress ? () => onEntryPress(item) : undefined}
      onEdit={onEntryEdit ? () => onEntryEdit(item) : undefined}
      onDelete={onEntryDelete ? () => onEntryDelete(item.id) : undefined}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer} testID="empty-timeline">
      <Text style={styles.emptyTitle}>No entries for this day</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add your first entry
      </Text>
    </View>
  );

  if (entries.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      testID="timeline-flatlist"
      data={sortedEntries}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      // Performance optimizations for large lists
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 120, // Approximate item height
        offset: 120 * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
