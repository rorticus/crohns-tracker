import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/UI/Button';

interface EmptyStateProps {
  date?: string;
  onAddEntry?: () => void;
}

export function EmptyState({ date, onAddEntry }: EmptyStateProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'this day';

  return (
    <View style={styles.container} testID="empty-state">
      <Text style={styles.icon}>📝</Text>
      <Text style={styles.title}>No entries yet</Text>
      <Text style={styles.subtitle}>
        You haven&apos;t logged any entries for {formattedDate}
      </Text>
      {onAddEntry && (
        <Button
          title="Add First Entry"
          onPress={onAddEntry}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F2F2F7',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
  },
});
