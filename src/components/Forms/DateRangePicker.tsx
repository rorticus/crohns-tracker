import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const getQuickRange = (days: number): { start: string; end: string } => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handleQuickRange = (days: number) => {
    const range = getQuickRange(days);
    onStartDateChange(range.start);
    onEndDateChange(range.end);
  };

  const getDayCount = (): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Date Range</Text>

      <View style={styles.quickRanges}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => handleQuickRange(7)}
          accessibilityRole="button"
          accessibilityLabel="Last 7 days"
        >
          <Text style={styles.quickButtonText}>Last 7 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => handleQuickRange(30)}
          accessibilityRole="button"
          accessibilityLabel="Last 30 days"
        >
          <Text style={styles.quickButtonText}>Last 30 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => handleQuickRange(90)}
          accessibilityRole="button"
          accessibilityLabel="Last 90 days"
        >
          <Text style={styles.quickButtonText}>Last 90 Days</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateInputs}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <TextInput
            style={styles.dateInput}
            value={startDate}
            onChangeText={onStartDateChange}
            placeholder="YYYY-MM-DD"
            accessibilityLabel="Start date"
            accessibilityHint="Enter start date in YYYY-MM-DD format"
          />
        </View>

        <View style={styles.separator}>
          <Text style={styles.separatorText}>to</Text>
        </View>

        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>End Date</Text>
          <TextInput
            style={styles.dateInput}
            value={endDate}
            onChangeText={onEndDateChange}
            placeholder="YYYY-MM-DD"
            accessibilityLabel="End date"
            accessibilityHint="Enter end date in YYYY-MM-DD format"
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Selected range: {getDayCount()} day{getDayCount() !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  quickRanges: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  separator: {
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  separatorText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoContainer: {
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
