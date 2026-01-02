import useTheme from "@/hooks/useTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";
import Text from "./text";

type DayAttribute = {
  highlighted?: boolean;
  marked?: boolean;
};

export default function Calendar({
  month,
  year,
  dayAttributes,
  onDaySelected,
  onMonthForward,
  onMonthBackward,
}: {
  month: number;
  year: number;
  dayAttributes?: Record<number, DayAttribute>;
  onMonthForward?: () => void;
  onMonthBackward?: () => void;
  onDaySelected?: (date: Date) => void;
}) {
  const theme = useTheme();

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const numberOfDays = new Date(year, month, 0).getDate(); // number of days in month
  const weeks = Math.ceil((numberOfDays + firstDay) / 7);

  return (
    <View>
      <View
        style={{ alignItems: "center", flexDirection: "row", marginBottom: 8 }}
      >
        <Pressable onPress={onMonthBackward}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 8 }}>
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <Pressable onPress={onMonthForward}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View
            key={day}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{day}</Text>
          </View>
        ))}
      </View>
      {Array.from({ length: weeks }).map((_, weekIndex) => (
        <View key={weekIndex} style={{ flexDirection: "row" }}>
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const dayNumber = weekIndex * 7 + dayIndex - firstDay + 1;
            const isValidDay = dayNumber > 0 && dayNumber <= numberOfDays;
            const { highlighted, marked } = isValidDay
              ? dayAttributes?.[dayNumber] || {}
              : {};
            const color = isValidDay
              ? highlighted
                ? theme.colors.primary
                : theme.colors.text
              : theme.colors.inactive;

            return (
              <Pressable
                key={dayIndex}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  const date = new Date(year, month - 1, dayNumber);
                  onDaySelected?.(date);
                }}
              >
                {isValidDay ? (
                  <View>
                    <Text
                      style={{
                        color,
                        fontWeight: highlighted ? "bold" : "normal",
                      }}
                    >
                      {dayNumber}
                    </Text>

                    {marked ? (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: color,
                          alignSelf: "center",
                          marginTop: 2,
                          position: "absolute",
                          bottom: -8,
                        }}
                      ></View>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
