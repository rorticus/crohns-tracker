import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TimelineComponent, TimelineEntry } from '@/components/Timeline/TimelineComponent';
import { EmptyState } from '@/components/Timeline/EmptyState';
import { useAppStateRefresh } from '@/hooks/useAppStateRefresh';
import { useEntryStore } from '@/stores/entryStore';
import { getCurrentDate } from '@/utils/dateUtils';

interface TimelineScreenProps {
  selectedDate?: string;
}

export default function TimelineScreen({ selectedDate }: TimelineScreenProps) {
  const router = useRouter();
  const {
    entries,
    isLoading,
    error,
    fetchEntriesByDate,
    deleteEntry,
  } = useEntryStore();

  const getTodayString = () => getCurrentDate();
  
  const [currentDate, setCurrentDate] = useState(
    selectedDate || getTodayString()
  );

  // Refresh to today's date when app comes back to foreground after 1 hour
  useAppStateRefresh({
    onForeground: () => {
      const today = getTodayString();
      if (currentDate !== today) {
        setCurrentDate(today);
      }
    },
    inactivityThresholdMs: 60 * 60 * 1000, // 1 hour
  });

  useEffect(() => {
    fetchEntriesByDate(currentDate);
  }, [currentDate, fetchEntriesByDate]);

  const handleEntryPress = (entry: TimelineEntry) => {
    // Navigate to entry details or edit screen
    router.push(`/entry/${entry.id}`);
  };

  const handleEntryEdit = (entry: TimelineEntry) => {
    router.push(`/entry/${entry.id}`);
  };

  const handleEntryDelete = async (entryId: number) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entryId);
              Alert.alert('Success', 'Entry deleted successfully');
            } catch {
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddEntry = () => {
    router.push('/entry/new');
  };

  const handlePreviousDay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    setCurrentDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const handleNextDay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    setCurrentDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const handleToday = () => {
    setCurrentDate(getTodayString());
  };

  const formatDate = (dateString: string) => {
    const todayString = getTodayString();

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateString === todayString) {
      return 'Today';
    } else if (dateString === yesterdayString) {
      return 'Yesterday';
    } else {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load entries</Text>
          <TouchableOpacity
            onPress={() => fetchEntriesByDate(currentDate)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.dateNavigation}>
          <TouchableOpacity
            onPress={handlePreviousDay}
            style={styles.navButton}
            accessibilityLabel="Previous day"
            accessibilityRole="button"
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            <Text style={styles.dateSubtext}>
              {(() => {
                const [year, month, day] = currentDate.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
              })()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            style={styles.navButton}
            accessibilityLabel="Next day"
            accessibilityRole="button"
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {currentDate !== getTodayString() && (
          <TouchableOpacity
            onPress={handleToday}
            style={styles.todayButton}
            accessibilityLabel="Go to today"
            accessibilityRole="button"
          >
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : entries.length === 0 ? (
        <EmptyState date={currentDate} onAddEntry={handleAddEntry} />
      ) : (
        <TimelineComponent
          entries={entries}
          onEntryPress={handleEntryPress}
          onEntryEdit={handleEntryEdit}
          onEntryDelete={handleEntryDelete}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddEntry}
        accessibilityLabel="Add new entry"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    padding: 16,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 8,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
