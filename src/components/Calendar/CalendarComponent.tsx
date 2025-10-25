/**
 * Calendar Component with Date Selection
 * Displays a calendar with entry indicators and date selection
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Calendar as RNCalendar, DateData, MarkedDates } from 'react-native-calendars';
import { CombinedEntry } from '@/types/entry';

export interface CalendarComponentProps {
  selectedDate: string;
  entries: CombinedEntry[];
  onDateSelect: (date: string) => void;
  testID?: string;
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  entries,
  onDateSelect,
  testID = 'calendar-component',
}) => {
  // Create marked dates object from entries
  const markedDates = useMemo<MarkedDates>(() => {
    const marked: MarkedDates = {};

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return {};
    }, {} as Record<string, CombinedEntry[]>);

    // Mark dates with entries
    Object.keys(entriesByDate).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#007AFF',
      };
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#007AFF',
        selectedTextColor: '#FFFFFF',
      };
    }

    return marked;
  }, [entries, selectedDate]);

  const handleDayPress = (day: DateData) => {
    onDateSelect(day.dateString);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container} testID={testID}>
      <RNCalendar
        current={selectedDate || today}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        maxDate={today}
        theme={{
          backgroundColor: '#FFFFFF',
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#8E8E93',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#007AFF',
          dayTextColor: '#1C1C1E',
          textDisabledColor: '#C7C7CC',
          dotColor: '#007AFF',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#007AFF',
          monthTextColor: '#1C1C1E',
          indicatorColor: '#007AFF',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        enableSwipeMonths={true}
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityLabel="Calendar for selecting dates"
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Has entries</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
