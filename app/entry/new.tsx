import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BowelMovementForm } from '@/components/Forms/BowelMovementForm';
import { NoteForm } from '@/components/Forms/NoteForm';

type EntryType = 'bowel_movement' | 'note';

export default function NewEntryScreen() {
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);

  if (selectedType === 'bowel_movement') {
    return <BowelMovementForm onCancel={() => setSelectedType(null)} />;
  }

  if (selectedType === 'note') {
    return <NoteForm onCancel={() => setSelectedType(null)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Entry</Text>
        <Text style={styles.subtitle}>What would you like to track?</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.typeCard}
          onPress={() => setSelectedType('bowel_movement')}
          accessibilityRole="button"
          accessibilityLabel="Log bowel movement"
        >
          <Text style={styles.typeIcon}>🚽</Text>
          <Text style={styles.typeTitle}>Bowel Movement</Text>
          <Text style={styles.typeDescription}>
            Track consistency and urgency using the Bristol scale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.typeCard}
          onPress={() => setSelectedType('note')}
          accessibilityRole="button"
          accessibilityLabel="Log note"
        >
          <Text style={styles.typeIcon}>📝</Text>
          <Text style={styles.typeTitle}>Note</Text>
          <Text style={styles.typeDescription}>
            Record food, exercise, medication, or other observations
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
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
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});