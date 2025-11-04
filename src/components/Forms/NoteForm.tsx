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
import { DatePicker } from '@/components/UI/DatePicker';
import { TimePicker } from '@/components/UI/TimePicker';
import { CreateNoteInput } from '@/types/entry';
import { validateNoteInput } from '@/services/validationService';
import { getCurrentDate, getCurrentTime } from '@/utils/dateUtils';

interface NoteFormProps {
  initialData?: Partial<CreateNoteInput>;
  onSubmit?: (data: CreateNoteInput) => Promise<void>;
  onCancel?: () => void;
}

const categoryOptions = [
  { value: 'food', label: 'Food', icon: '🍽️', description: 'Meals, snacks, dietary changes' },
  { value: 'exercise', label: 'Exercise', icon: '🏃', description: 'Physical activity, sports' },
  { value: 'medication', label: 'Medication', icon: '💊', description: 'Prescriptions, supplements' },
  { value: 'other', label: 'Other', icon: '📝', description: 'General observations' },
] as const;

export function NoteForm({
  initialData,
  onSubmit,
  onCancel
}: NoteFormProps) {
  const router = useRouter();
  const { createNote, isCreating } = useEntryStore();

  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<CreateNoteInput>({
    defaultValues: {
      date: initialData?.date || currentDate,
      time: initialData?.time || currentTime,
      category: initialData?.category || 'other',
      content: initialData?.content || '',
      tags: initialData?.tags || '',
    },
  });

  const handleSubmit = async (data: CreateNoteInput) => {
    try {
      // Validate the input
      const validation = validateNoteInput(data);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      if (onSubmit) {
        await onSubmit(data);
      } else {
        await createNote(data);
        Alert.alert('Success', 'Note logged successfully!');
        router.back();
      }
    } catch {
      Alert.alert('Error', 'Failed to log note. Please try again.');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const renderCategoryOption = (
    category: typeof categoryOptions[number],
    selectedValue: string,
    onChange: (value: string) => void
  ) => {
    const isSelected = selectedValue === category.value;
    return (
      <TouchableOpacity
        key={category.value}
        style={[styles.categoryOption, isSelected && styles.selectedOption]}
        onPress={() => onChange(category.value)}
        accessibilityRole="button"
        accessibilityLabel={`Category: ${category.label} - ${category.description}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryIcon, isSelected && styles.selectedIconText]}>
            {category.icon}
          </Text>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryLabel, isSelected && styles.selectedText]}>
              {category.label}
            </Text>
            <Text style={[styles.categoryDescription, isSelected && styles.selectedSubtext]}>
              {category.description}
            </Text>
          </View>
        </View>
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
            <Text style={styles.title}>Log Note</Text>
            <Text style={styles.subtitle}>Record contextual information</Text>
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
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
                <DatePicker
                  value={value}
                  onChange={onChange}
                  label="Date"
                  error={errors.date?.message}
                />
              )}
            />
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
                <TimePicker
                  value={value}
                  onChange={onChange}
                  label="Time"
                  error={errors.time?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <Text style={styles.sectionDescription}>
            Select the type of note you&apos;re recording
          </Text>
          <Controller
            control={control}
            name="category"
            rules={{
              required: 'Category is required',
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                {categoryOptions.map(cat => renderCategoryOption(cat, value, onChange))}
              </View>
            )}
          />
          {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note Content</Text>
          <Controller
            control={control}
            name="content"
            rules={{
              required: 'Note content is required',
              minLength: { value: 1, message: 'Content cannot be empty' },
              maxLength: { value: 1000, message: 'Content cannot exceed 1000 characters' }
            }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[styles.contentInput, errors.content && styles.errorInput]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Describe what you want to track..."
                  multiline
                  numberOfLines={5}
                  maxLength={1000}
                  accessibilityLabel="Note content"
                  accessibilityHint="Describe what you want to track, maximum 1000 characters"
                />
                <Text style={styles.characterCount}>
                  {value?.length || 0}/1000 characters
                </Text>
              </>
            )}
          />
          {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Add comma-separated tags for easier searching
          </Text>
          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.tagsInput}
                value={value}
                onChangeText={onChange}
                placeholder="e.g. breakfast, gluten-free, important"
                accessibilityLabel="Tags"
                accessibilityHint="Optional comma-separated tags"
              />
            )}
          />
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
            title="Save Note"
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
  categoryContainer: {
    gap: 12,
  },
  categoryOption: {
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  selectedIconText: {
    opacity: 1,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  selectedSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  tagsInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
