import Calendar from "@/components/calendar";
import Card from "@/components/card";
import CircleIcon from "@/components/circleIcon";
import { DayTagManager } from "@/components/DayTags";
import Screen from "@/components/screen";
import Text from "@/components/text";
import useDayTagsForDate from "@/hooks/useDayTagsForDate";
import useTheme from "@/hooks/useTheme";
import useEvents from "@/stores/useEvents";
import {
  decrementMonth,
  formatDateForDatabase,
  formatTimeForDisplay,
  incrementMonth,
} from "@/utils/dateUtils";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { ReactNode, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function HomeScreen() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
  });
  const [showDayTagManager, setShowDayTagManager] = useState(false);

  const monthEntries = useEvents({
    year: calendarDate.year,
    month: calendarDate.month,
  });

  const selectedDateEntries = useEvents({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
    day: selectedDate.getDate(),
  });

  const dayTags = useDayTagsForDate(formatDateForDatabase(selectedDate));

  const dayAttributes = useMemo(() => {
    const attrs: Record<number, { highlighted?: boolean; marked?: boolean }> =
      {};

    if (
      calendarDate.year === selectedDate.getFullYear() &&
      calendarDate.month === selectedDate.getMonth() + 1
    ) {
      attrs[selectedDate.getDate()] = { highlighted: true };
    }

    monthEntries.data.forEach((entry) => {
      const entryDate = new Date(entry.entry.timestamp);
      if (
        entryDate.getFullYear() === calendarDate.year &&
        entryDate.getMonth() === calendarDate.month - 1
      ) {
        const day = entryDate.getDate();
        attrs[day] = { ...(attrs[day] || {}), marked: true };
      }
    });

    return attrs;
  }, [calendarDate, selectedDate, monthEntries.data]);

  const morningEntries = selectedDateEntries.data.filter(
    (e) => e.entry.time < "12:00:00"
  );
  const afternoonEntries = selectedDateEntries.data.filter(
    (e) => e.entry.time >= "12:00:00" && e.entry.time < "17:00:00"
  );
  const eveningEntries = selectedDateEntries.data.filter(
    (e) => e.entry.time >= "17:00:00"
  );

  return (
    <Screen>
      <DayTagManager
        visible={showDayTagManager}
        date={formatDateForDatabase(selectedDate)}
        onClose={() => setShowDayTagManager(false)}
      />
      <ScrollView contentContainerStyle={{ padding: 8 }}>
        <View style={{ marginBottom: 32 }}>
          <Calendar
            month={calendarDate.month}
            year={calendarDate.year}
            dayAttributes={dayAttributes}
            onMonthForward={() => {
              setCalendarDate((cur) => incrementMonth(cur.year, cur.month));
            }}
            onMonthBackward={() => {
              setCalendarDate((cur) => decrementMonth(cur.year, cur.month));
            }}
            onDaySelected={(date) => {
              setSelectedDate(date);
            }}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "heavy", flex: 1 }}>
              {format(selectedDate, "MMM do, yyyy")}
            </Text>
            <Pressable
              hitSlop={20}
              onPress={() => {
                setShowDayTagManager(true);
              }}
            >
              <Ionicons
                name="pricetags-outline"
                size={24}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
          {dayTags.data.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {dayTags.data.map((tag) => (
                <View
                  key={tag.id}
                  style={{
                    backgroundColor: theme.colors.primary + "22",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: theme.colors.primary }}>
                    {tag.displayName}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {morningEntries.length > 0 && (
          <MedicationList
            title="Morning"
            icon="sunny"
            entries={morningEntries}
          />
        )}
        {afternoonEntries.length > 0 && (
          <MedicationList
            title="Afternoon"
            icon="partly-sunny"
            entries={afternoonEntries}
          />
        )}
        {eveningEntries.length > 0 && (
          <MedicationList
            title="Evening"
            icon="moon"
            entries={eveningEntries}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function EntryCard({
  entry,
}: {
  entry: ReturnType<typeof useEvents>["data"][0];
}) {
  const theme = useTheme();
  const router = useRouter();

  switch (entry.entry.type) {
    case "bowel_movement":
      return (
        <Card
          onPress={() => router.push(`/edit-entry?id=${entry.entry.id}`)}
          leftIcon={
            <CircleIcon
              icon={({ color, size }) => (
                <FontAwesome5 name="toilet" color={color} size={size} />
              )}
              color={"#A2845E"}
            />
          }
          rightIcon={
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="time"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={{ color: theme.colors.textSecondary }}>
                {formatTimeForDisplay(entry.entry.time)}
              </Text>
            </View>
          }
        >
          <View
            style={{
              gap: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.textSecondary }}>
              Bristol: {entry.bowelMovement?.consistency}
            </Text>
            <Ionicons
              name="ellipse"
              size={6}
              color={theme.colors.textSecondary}
            />
            <Text style={{ color: theme.colors.textSecondary }}>
              Urgency: {entry.bowelMovement?.urgency}
            </Text>
          </View>
        </Card>
      );
    case "note": {
      let icon: ({
        color,
        size,
      }: {
        color: string;
        size: number;
      }) => ReactNode = ({ color, size }) => (
        <Ionicons name="document-text" color={color} size={size} />
      );
      let color: string = "#8E8E93";

      switch (entry.note?.category) {
        case "medication":
          icon = ({ color, size }) => (
            <FontAwesome5 name="pills" color={color} size={size} />
          );
          color = "#68D1BF";
          break;

        case "exercise":
          icon = ({ color, size }) => (
            <Ionicons name="barbell" color={color} size={size} />
          );
          color = "#FF9F0A";
          break;

        case "food":
          icon = ({ color, size }) => (
            <Ionicons name="restaurant" color={color} size={size} />
          );
          color = "#FF375F";
          break;
      }

      return (
        <Card
          onPress={() => router.push(`/edit-entry?id=${entry.entry.id}`)}
          leftIcon={<CircleIcon icon={icon} color={color} />}
          rightIcon={
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="time"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={{ color: theme.colors.textSecondary }}>
                {formatTimeForDisplay(entry.entry.time)}
              </Text>
            </View>
          }
        >
          <Text style={{ color: theme.colors.textSecondary }}>
            {entry.note?.content}
          </Text>
        </Card>
      );
    }
  }
}

function MedicationList({
  title,
  icon,
  entries,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  entries: ReturnType<typeof useEvents>["data"];
}) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: 32, gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons name={icon} size={20} color={theme.colors.accent} />
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 18,
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          {title}
        </Text>
      </View>
      {entries.map((entry) => (
        <EntryCard key={entry.entry.id} entry={entry} />
      ))}
    </View>
  );
}
