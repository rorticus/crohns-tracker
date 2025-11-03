/**
 * Calendar Component with Date Selection
 * Displays a calendar with entry indicators and day tag indicators
 */

import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Calendar as RNCalendar, DateData, MarkedDates } from 'react-native-calendars';
import { CombinedEntry } from '@/types/entry';
import { useDayTagStore } from '../../stores/dayTagStore';
import { getCurrentDate } from '@/utils/dateUtils';

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
  const { taggedDatesInMonth, loadTaggedDatesInMonth } = useDayTagStore();
  
  // Track the current date and update it when it changes
  const [today, setToday] = useState(() => getCurrentDate());

  // Update today when the date changes (check every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getCurrentDate();
      if (newToday !== today) {
        setToday(newToday);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [today]);

  // Load tagged dates for current month when component mounts or month changes
  useEffect(() => {
    const date = selectedDate
      ? (() => {
          const [year, month, day] = selectedDate.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    loadTaggedDatesInMonth(year, month);
  }, [selectedDate, loadTaggedDatesInMonth]);

  // Create marked dates object from entries and tags
  const markedDates = useMemo<MarkedDates>(() => {
    const marked: MarkedDates = {};

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, CombinedEntry[]>);

    // Mark dates with entries and/or tags
    const allDates = new Set([
      ...Object.keys(entriesByDate),
      ...Object.keys(taggedDatesInMonth),
    ]);

    allDates.forEach((date) => {
      const hasEntries = !!entriesByDate[date];
      const hasTags = !!taggedDatesInMonth[date];
      const dots = [];

      if (hasEntries) {
        dots.push({ key: 'entries', color: '#007AFF' });
      }
      if (hasTags) {
        dots.push({ key: 'tags', color: '#FF9500' });
      }

      marked[date] = {
        marked: true,
        dots: dots,
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
  }, [entries, taggedDatesInMonth, selectedDate]);

  const handleDayPress = (day: DateData) => {
    onDateSelect(day.dateString);
  };

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
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>Has tags</Text>
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
