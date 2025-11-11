/**
 * Calendar Component with Date Selection
 * Displays a calendar with entry indicators and day tag indicators
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Calendar as RNCalendar, DateData, MarkedDates } from 'react-native-calendars';
import { CombinedEntry } from '@/types/entry';
import { useDayTagStore } from '../../stores/dayTagStore';
import { getCurrentDate } from '@/utils/dateUtils';
import { useAppStateRefresh } from '@/hooks/useAppStateRefresh';
import { getEntriesForDateRange } from '@/services/entryService';

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
  
  // Track entries for the displayed month
  const [monthEntries, setMonthEntries] = useState<CombinedEntry[]>([]);
  
  // Track the currently displayed month
  const [displayedMonth, setDisplayedMonth] = useState<{ year: number; month: number }>(() => {
    const date = selectedDate
      ? (() => {
          const [year, month, day] = selectedDate.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date();
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // getMonth() returns 0-11
    };
  });

  // Load entries for the displayed month
  const loadMonthEntries = useCallback(async (year: number, month: number) => {
    try {
      // Calculate first and last day of the month
      const lastDay = new Date(year, month, 0);
      
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      const entries = await getEntriesForDateRange(startDate, endDate);
      setMonthEntries(entries);
    } catch (error) {
      console.error('Failed to load month entries:', error);
      setMonthEntries([]);
    }
  }, []);

  // Update today when app comes to foreground and reload data
  const handleForeground = useCallback(() => {
    const newToday = getCurrentDate();
    const todayChanged = newToday !== today;
    
    if (todayChanged) {
      setToday(newToday);
      // Reload entries and tags for the month when date changes
      loadMonthEntries(displayedMonth.year, displayedMonth.month);
      loadTaggedDatesInMonth(displayedMonth.year, displayedMonth.month);
    }
  }, [today, displayedMonth, loadMonthEntries, loadTaggedDatesInMonth]);

  useAppStateRefresh({
    onForeground: handleForeground,
    inactivityThresholdMs: 0, // Always check on foreground, no threshold
  });

  // Load tagged dates and entries for current month when displayedMonth changes
  useEffect(() => {
    loadTaggedDatesInMonth(displayedMonth.year, displayedMonth.month);
    loadMonthEntries(displayedMonth.year, displayedMonth.month);
  }, [displayedMonth, loadTaggedDatesInMonth, loadMonthEntries]);

  // Create marked dates object from entries and tags
  const markedDates = useMemo<MarkedDates>(() => {
    const marked: MarkedDates = {};

    // Group month entries by date
    const entriesByDate = monthEntries.reduce((acc, entry) => {
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
  }, [monthEntries, taggedDatesInMonth, selectedDate]);

  const handleDayPress = (day: DateData) => {
    onDateSelect(day.dateString);
  };

  const handleMonthChange = (date: DateData) => {
    const newMonth = {
      year: date.year,
      month: date.month,
    };
    setDisplayedMonth(newMonth);
  };

  return (
    <View style={styles.container} testID={testID}>
      <RNCalendar
        current={selectedDate || today}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
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
