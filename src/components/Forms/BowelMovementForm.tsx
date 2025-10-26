import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useEntryStore } from '@/stores/entryStore';
import { Button } from '@/components/UI/Button';
import { CreateBowelMovementInput } from '@/types/entry';
import { validateBowelMovementInput } from '@/services/validationService';

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

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<CreateBowelMovementInput>({
    defaultValues: {
      date: initialData?.date || currentDate,
      time: initialData?.time || currentTime,
      consistency: initialData?.consistency || 4,
      urgency: initialData?.urgency || 2,
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = async (data: CreateBowelMovementInput) => {
    try {
      // Validate the input
      const validation = validateBowelMovementInput(data);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await createBowelMovement(data);
        Alert.alert('Success', 'Bowel movement logged successfully!');
        router.back();
      }
    } catch {
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

  const renderConsistencyOption = (value: number, selectedValue: number, onChange: (value: number) => void) => {
    const isSelected = selectedValue === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.scaleOption, isSelected && styles.selectedOption]}
        onPress={() => onChange(value)}
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

  const renderUrgencyOption = (value: number, selectedValue: number, onChange: (value: number) => void) => {
    const isSelected = selectedValue === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.urgencyOption, isSelected && styles.selectedOption]}
        onPress={() => onChange(value)}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Log Bowel Movement</Text>
            <Text style={styles.subtitle}>Track your symptoms</Text>
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeField}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Controller
                control={control}
                name="date"
                rules={{
                  required: 'Date is required',
                  pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$/,
                    message: 'Date must be in YYYY-MM-DD format'
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.dateTimeInput, errors.date && styles.errorInput]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="YYYY-MM-DD"
                    accessibilityLabel="Entry date"
                    accessibilityHint="Enter date in YYYY-MM-DD format"
                  />
                )}
              />
              {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
            </View>
            <View style={styles.dateTimeField}>
              <Text style={styles.fieldLabel}>Time</Text>
              <Controller
                control={control}
                name="time"
                rules={{
                  required: 'Time is required',
                  pattern: {
                    value: /^\d{2}:\d{2}$/,
                    message: 'Time must be in HH:MM format'
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.dateTimeInput, errors.time && styles.errorInput]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="HH:MM"
                    accessibilityLabel="Entry time"
                    accessibilityHint="Enter time in HH:MM format"
                  />
                )}
              />
              {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bristol Stool Scale</Text>
          <Text style={styles.sectionDescription}>
            Select the consistency that best matches your bowel movement
          </Text>
          <Controller
            control={control}
            name="consistency"
            rules={{
              required: 'Consistency is required',
              min: { value: 1, message: 'Consistency must be between 1 and 7' },
              max: { value: 7, message: 'Consistency must be between 1 and 7' }
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.scaleContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map(num => renderConsistencyOption(num, value, onChange))}
              </View>
            )}
          />
          {errors.consistency && <Text style={styles.errorText}>{errors.consistency.message}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>
          <Text style={styles.sectionDescription}>
            How urgent was the need to use the bathroom?
          </Text>
          <Controller
            control={control}
            name="urgency"
            rules={{
              required: 'Urgency is required',
              min: { value: 1, message: 'Urgency must be between 1 and 4' },
              max: { value: 4, message: 'Urgency must be between 1 and 4' }
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.urgencyContainer}>
                {[1, 2, 3, 4].map(num => renderUrgencyOption(num, value, onChange))}
              </View>
            )}
          />
          {errors.urgency && <Text style={styles.errorText}>{errors.urgency.message}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <Controller
            control={control}
            name="notes"
            rules={{
              maxLength: { value: 500, message: 'Notes cannot exceed 500 characters' }
            }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[styles.notesInput, errors.notes && styles.errorInput]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Any additional notes about this bowel movement..."
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  accessibilityLabel="Additional notes"
                  accessibilityHint="Optional notes about this bowel movement, maximum 500 characters"
                />
                <Text style={styles.characterCount}>
                  {value?.length || 0}/500 characters
                </Text>
              </>
            )}
          />
          {errors.notes && <Text style={styles.errorText}>{errors.notes.message}</Text>}
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
            onPress={handleFormSubmit(handleSubmit)}
            loading={isCreating}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  errorInput: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});