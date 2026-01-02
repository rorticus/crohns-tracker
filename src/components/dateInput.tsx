import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import Button from "./button";
import Calendar from "./calendar";
import Card from "./card";

type DateInputProps = {
  value: string;
  onChange: (newDate: string) => void;
};

export default function DateInput({ value, onChange }: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<{
    year: number;
    month: number;
  }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  useEffect(() => {
    if (showCalendar) {
      const [year, month] = value.split("-").map(Number);
      setCalendarDate({ year, month });
    }
  }, [showCalendar, value]);

  return (
    <View>
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
          }}
        >
          <Card>
            <Calendar
              year={calendarDate.year}
              month={calendarDate.month}
              onMonthForward={() => {
                setCalendarDate((prev) => ({
                  year: prev.year,
                  month: prev.month + 1,
                }));
              }}
              onMonthBackward={() => {
                setCalendarDate((prev) => ({
                  year: prev.year,
                  month: prev.month - 1,
                }));
              }}
            />
          </Card>
        </View>
      </Modal>
      <Button
        leftIcon={({ color, size }) => (
          <Ionicons name="calendar" size={size} color={color} />
        )}
        title={value}
        onPress={() => setShowCalendar(true)}
      />
    </View>
  );
}
