import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEntryStore } from '@/stores/entryStore';
import { Button } from '@/components/UI/Button';
import { CreateBowelMovementInput } from '@/types/entry';

interface BowelMovementFormProps {
  initialData?: Partial<CreateBowelMovementInput>;
  onSubmit?: (data: CreateBowelMovementInput) => Promise<void>;
  onCancel?: () => void;
}

const bristolScaleDescriptions = {
  1: 'Separate hard lumps, like nuts',
  2: 'Sausage-shaped but lumpy',
  3: 'Like a sausage but with cracks',
  4: 'Like a sausage, smooth and soft',
  5: 'Soft blobs with clear-cut edges',
  6: 'Fluffy pieces with ragged edges',
  7: 'Watery, no solid pieces',
};

const urgencyDescriptions = {
  1: 'No urgency - could wait',
  2: 'Mild urgency - some pressure',
  3: 'Moderate urgency - needed soon',
  4: 'Extreme urgency - couldn\'t wait',
};

export function BowelMovementForm({
  initialData,
  onSubmit,
  onCancel
}: BowelMovementFormProps) {
  const router = useRouter();
  const { createBowelMovement, isCreating } = useEntryStore();

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const [formData, setFormData] = useState<CreateBowelMovementInput>({
    date: initialData?.date || currentDate,
    time: initialData?.time || currentTime,
    consistency: initialData?.consistency || 4,
    urgency: initialData?.urgency || 2,
    notes: initialData?.notes || '',
  });

  const handleSubmit = async () => {
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await createBowelMovement(formData);
        Alert.alert('Success', 'Bowel movement logged successfully!');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log bowel movement. Please try again.');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const renderConsistencyOption = (value: number) => {
    const isSelected = formData.consistency === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.scaleOption, isSelected && styles.selectedOption]}
        onPress={() => setFormData(prev => ({ ...prev, consistency: value as any }))}
        accessibilityRole="button"
        accessibilityLabel={`Bristol scale ${value}: ${bristolScaleDescriptions[value as keyof typeof bristolScaleDescriptions]}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.scaleHeader}>
          <Text style={[styles.scaleNumber, isSelected && styles.selectedText]}>
            {value}
          </Text>
        </View>
        <Text style={[styles.scaleDescription, isSelected && styles.selectedText]}>
          {bristolScaleDescriptions[value as keyof typeof bristolScaleDescriptions]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUrgencyOption = (value: number) => {
    const isSelected = formData.urgency === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.urgencyOption, isSelected && styles.selectedOption]}
        onPress={() => setFormData(prev => ({ ...prev, urgency: value as any }))}
        accessibilityRole="button"
        accessibilityLabel={`Urgency level ${value}: ${urgencyDescriptions[value as keyof typeof urgencyDescriptions]}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={[styles.urgencyNumber, isSelected && styles.selectedText]}>
          {value}
        </Text>
        <Text style={[styles.urgencyDescription, isSelected && styles.selectedText]}>
          {urgencyDescriptions[value as keyof typeof urgencyDescriptions]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Log Bowel Movement</Text>
          <Text style={styles.subtitle}>Track your symptoms</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeField}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={styles.dateTimeInput}
                value={formData.date}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                accessibilityLabel="Entry date"
                accessibilityHint="Enter date in YYYY-MM-DD format"
              />
            </View>
            <View style={styles.dateTimeField}>
              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.dateTimeInput}
                value={formData.time}
                onChangeText={(text) => setFormData(prev => ({ ...prev, time: text }))}
                placeholder="HH:MM"
                accessibilityLabel="Entry time"
                accessibilityHint="Enter time in HH:MM format"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bristol Stool Scale</Text>
          <Text style={styles.sectionDescription}>
            Select the consistency that best matches your bowel movement
          </Text>
          <View style={styles.scaleContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map(renderConsistencyOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>
          <Text style={styles.sectionDescription}>
            How urgent was the need to use the bathroom?
          </Text>
          <View style={styles.urgencyContainer}>
            {[1, 2, 3, 4].map(renderUrgencyOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Any additional notes about this bowel movement..."
            multiline
            numberOfLines={3}
            maxLength={500}
            accessibilityLabel="Additional notes"
            accessibilityHint="Optional notes about this bowel movement, maximum 500 characters"
          />
          <Text style={styles.characterCount}>
            {formData.notes?.length || 0}/500 characters
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Save Entry"
          onPress={handleSubmit}
          loading={isCreating}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  dateTimeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  scaleContainer: {
    gap: 8,
  },
  scaleOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  scaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scaleNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    width: 24,
  },
  scaleDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  urgencyContainer: {
    gap: 8,
  },
  urgencyOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgencyNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    width: 24,
  },
  urgencyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});