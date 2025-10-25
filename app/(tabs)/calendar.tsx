import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEntryStore, useEntryOperations } from '@/stores/entryStore';
import { Button } from '@/components/UI/Button';
import { CalendarComponent } from '@/components/Calendar/CalendarComponent';

export default function CalendarScreen() {
  const router = useRouter();
  const { selectedDate, entries, isLoading, error, setSelectedDate } = useEntryStore();
  const { createTodaysBowelMovement } = useEntryOperations();

  const handleQuickBowelMovement = async () => {
    try {
      await createTodaysBowelMovement(4, 2, 'Quick entry from calendar');
      Alert.alert('Success', 'Bowel movement logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log bowel movement');
    }
  };

  const todaysEntries = entries.filter(entry => entry.date === selectedDate);

  return (
    <SafeAreaView style={styles.container} testID="calendar-screen">
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">Crohns Tracker</Text>
          <Text style={styles.subtitle}>Calendar View</Text>
        </View>

        <CalendarComponent
          selectedDate={selectedDate}
          entries={entries}
          onDateSelect={setSelectedDate}
        />

        {error && (
          <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Button
            title="Quick Bowel Movement"
            onPress={handleQuickBowelMovement}
            loading={isLoading}
            style={styles.button}
            testID="add-entry-button"
            accessibilityLabel="Quick log bowel movement with default values"
            accessibilityHint="Logs a bowel movement entry for today"
          />

          <Button
            title="Add Detailed Entry"
            onPress={() => router.push('/entry/new')}
            variant="outline"
            style={styles.button}
            accessibilityLabel="Add detailed entry"
            accessibilityHint="Opens form to add bowel movement with all details"
          />
        </View>

        <View style={styles.recentEntries}>
          <Text style={styles.sectionTitle}>Entries for {selectedDate}</Text>
          {todaysEntries.length === 0 ? (
            <Text style={styles.emptyText} accessibilityLabel="No entries for selected date">
              No entries for this date
            </Text>
          ) : (
            todaysEntries.map(entry => (
              <View key={entry.id} style={styles.entryItem} accessible={true} accessibilityLabel={`Entry at ${entry.time}`}>
                <Text style={styles.entryTime}>{entry.time}</Text>
                <Text style={styles.entryType}>
                  {entry.type === 'bowel_movement' ? '🚽' : '📝'} {entry.type}
                </Text>
                {entry.type === 'bowel_movement' && (
                  <Text style={styles.entryDetails}>
                    Bristol: {entry.bowelMovement.consistency}, Urgency: {entry.bowelMovement.urgency}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  quickActions: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  recentEntries: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 20,
  },
  entryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  entryTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  entryType: {
    fontSize: 16,
    color: '#1C1C1E',
    marginTop: 4,
  },
  entryDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
});