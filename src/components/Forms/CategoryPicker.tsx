import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type NoteCategory = 'food' | 'exercise' | 'medication' | 'other';

interface CategoryOption {
  value: NoteCategory;
  label: string;
  icon: string;
  description: string;
}

const categories: CategoryOption[] = [
  { value: 'food', label: 'Food', icon: '🍽️', description: 'Meals and dietary changes' },
  { value: 'exercise', label: 'Exercise', icon: '🏃', description: 'Physical activity' },
  { value: 'medication', label: 'Medication', icon: '💊', description: 'Prescriptions and supplements' },
  { value: 'other', label: 'Other', icon: '📝', description: 'General observations' },
];

interface CategoryPickerProps {
  value: NoteCategory;
  onChange: (category: NoteCategory) => void;
  disabled?: boolean;
}

export function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const isSelected = value === category.value;
        return (
          <TouchableOpacity
            key={category.value}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onChange(category.value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`${category.label}: ${category.description}`}
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <Text style={[styles.icon, isSelected && styles.selectedIcon]}>
              {category.icon}
            </Text>
            <View style={styles.textContainer}>
              <Text style={[styles.label, isSelected && styles.selectedText]}>
                {category.label}
              </Text>
              <Text style={[styles.description, isSelected && styles.selectedDescription]}>
                {category.description}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  selectedIcon: {
    opacity: 1,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
