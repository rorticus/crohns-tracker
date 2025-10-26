import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
  error?: string;
}

export function TimePicker({
  value,
  onChange,
  label,
  error,
}: TimePickerProps) {
  // Convert HH:MM string to Date object
  const getDateFromTime = React.useCallback((timeString: string): Date => {
    // Start with a fresh date object for today
    const date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Handle empty or invalid time strings - use current time
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
      return date;
    }

    const parts = timeString.trim().split(':');
    if (parts.length !== 2) {
      return date;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      date.setHours(hours, minutes, 0, 0);
    }

    return date;
  }, []);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(() => getDateFromTime(value));
  const [tempPickerDate, setTempPickerDate] = useState<Date>(() => getDateFromTime(value));

  // Update picker date when value changes (only when picker is closed)
  React.useEffect(() => {
    if (!showPicker) {
      const newDate = getDateFromTime(value);
      setPickerDate(newDate);
      setTempPickerDate(newDate);
    }
  }, [value, getDateFromTime, showPicker]);

  // Format Date object to HH:MM string
  const formatTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format for display (12-hour format)
  const formatDisplayTime = (timeString: string): string => {
    if (!timeString || !timeString.includes(':')) {
      return 'Select Time';
    }

    const date = getDateFromTime(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (!selectedDate) return;

    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);

      if (event.type === 'set') {
        setPickerDate(selectedDate);
        setTempPickerDate(selectedDate);
        const timeString = formatTimeString(selectedDate);
        onChange(timeString);
      }
    } else {
      // On iOS, just update temp state while picker is open
      // Don't call onChange until user taps "Done"
      setTempPickerDate(selectedDate);
    }
  };

  const handlePress = () => {
    // Reset temp date to current value when opening
    setTempPickerDate(pickerDate);
    setShowPicker(true);
  };

  const handleClose = () => {
    // Commit the change when closing on iOS
    if (Platform.OS === 'ios') {
      setPickerDate(tempPickerDate);
      const timeString = formatTimeString(tempPickerDate);
      onChange(timeString);
    }
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.button, error && styles.errorButton]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label || 'Select time'}
        accessibilityHint="Opens time picker to select a time"
      >
        <Text style={styles.buttonText}>
          {formatDisplayTime(value)}
        </Text>
        <Text style={styles.icon}>🕐</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Android native modal picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* iOS modal picker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleClose}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.iosDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempPickerDate}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.iosPicker}
                textColor="#1C1C1E"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorButton: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  icon: {
    fontSize: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  iosDoneButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  iosPicker: {
    backgroundColor: '#FFFFFF',
    height: 216,
  },
});
