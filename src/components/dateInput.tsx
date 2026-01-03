import useTheme from "@/hooks/useTheme";
import {
  decrementMonth,
  formatDateForDatabase,
  incrementMonth,
} from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Button from "./button";
import Calendar from "./calendar";
import Card from "./card";
import Text from "./text";

type DateInputProps = {
  value: string;
  onChange: (newDate: string) => void;
  fill?: boolean;
  title?: string;
};

export default function DateInput({
  fill,
  value,
  onChange,
  title,
}: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<{
    year: number;
    month: number;
  }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const theme = useTheme();

  useEffect(() => {
    if (showCalendar) {
      const [year, month] = value.split("-").map(Number);
      setCalendarDate({ year, month });
    }
  }, [showCalendar, value]);

  return (
    <>
      <Modal
        transparent={true}
        animationType="fade"
        visible={showCalendar}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000099",
            padding: 16,
          }}
        >
          <Card>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {title ?? "Select Date"}
              </Text>
              <Pressable onPress={() => setShowCalendar(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                  onPress={() => setShowCalendar(false)}
                />
              </Pressable>
            </View>

            <Calendar
              year={calendarDate.year}
              month={calendarDate.month}
              onMonthForward={() => {
                setCalendarDate((prev) =>
                  incrementMonth(prev.year, prev.month)
                );
              }}
              onMonthBackward={() => {
                setCalendarDate((prev) =>
                  decrementMonth(prev.year, prev.month)
                );
              }}
              dayAttributes={{
                [parseInt(value?.split("-")[2])]: {
                  highlighted: true,
                },
              }}
              onDaySelected={(date) => {
                onChange?.(formatDateForDatabase(date));
                setShowCalendar(false);
              }}
            />
          </Card>
        </View>
      </Modal>
      <Button
        fill={fill}
        leftIcon={({ color, size }) => (
          <Ionicons name="calendar" size={size} color={color} />
        )}
        title={value}
        onPress={() => setShowCalendar(true)}
      />
    </>
  );
}
