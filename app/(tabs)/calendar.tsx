import { CalendarComponent } from "@/components/Calendar/CalendarComponent";
import { DayTagManager } from "@/components/DayTags/DayTagManager";
import { Button } from "@/components/UI/Button";
import { useAppStateRefresh } from "@/hooks/useAppStateRefresh";
import { useEntryOperations, useEntryStore } from "@/stores/entryStore";
import { NOTE_CATEGORY_CONFIG } from "@/utils/constants";
import { formatDateShort, getCurrentDate } from "@/utils/dateUtils";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const router = useRouter();
  const { selectedDate, entries, isLoading, error, setSelectedDate } =
    useEntryStore();
  const { createTodaysBowelMovement } = useEntryOperations();
  const [tagManagerVisible, setTagManagerVisible] = useState(false);

  // Refresh to today's date when app comes back to foreground after 1 hour
  useAppStateRefresh({
    onForeground: () => {
      const today = getCurrentDate();
      if (selectedDate !== today) {
        setSelectedDate(today);
      }
    },
    inactivityThresholdMs: 60 * 60 * 1000, // 1 hour
  });

  const handleQuickBowelMovement = async () => {
    try {
      await createTodaysBowelMovement(4, 2, "Quick entry from calendar");
      Alert.alert("Success", "Bowel movement logged successfully!");
    } catch {
      Alert.alert("Error", "Failed to log bowel movement");
    }
  };

  const handleEntryPress = (entryId: number) => {
    router.push(`/entry/${entryId}`);
  };

  const todaysEntries = entries.filter((entry) => entry.date === selectedDate);
  const bowelMovementCount = todaysEntries.filter(
    (entry) => entry.type === "bowel_movement"
  ).length;
  const noteCount = todaysEntries.filter(
    (entry) => entry.type === "note"
  ).length;

  return (
    <ScrollView>
      <SafeAreaView style={styles.container} testID="calendar-screen">
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Crohns Tracker
          </Text>
          <Text style={styles.subtitle}>Calendar View</Text>
        </View>

        <CalendarComponent
          selectedDate={selectedDate}
          entries={entries}
          onDateSelect={setSelectedDate}
        />

        {error && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Button
            title="Manage Day Tags"
            onPress={() => setTagManagerVisible(true)}
            variant="outline"
            style={styles.button}
            testID="manage-tags-button"
            accessibilityLabel="Manage tags for selected date"
            accessibilityHint="Opens modal to add or remove tags for this day"
          />

          <Button
            title="Quick Bowel Movement"
            onPress={handleQuickBowelMovement}
            loading={isLoading}
            style={styles.button}
            testID="add-entry-button"
            accessibilityLabel="Quick log bowel movement with default values"
            accessibilityHint="Logs a bowel movement entry for today"
          />

          <Button
            title="Add Detailed Entry"
            onPress={() => router.push("/entry/new")}
            variant="outline"
            style={styles.button}
            accessibilityLabel="Add detailed entry"
            accessibilityHint="Opens form to add bowel movement with all details"
          />
        </View>

        <View style={styles.recentEntries}>
          <Text style={styles.sectionTitle}>
            Entries for {formatDateShort(selectedDate)}
          </Text>

          {/* Entry Summary */}
          {todaysEntries.length > 0 && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>🚽</Text>
                <Text style={styles.summaryText}>
                  {bowelMovementCount}{" "}
                  {bowelMovementCount === 1
                    ? "Bowel Movement"
                    : "Bowel Movements"}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>📝</Text>
                <Text style={styles.summaryText}>
                  {noteCount} {noteCount === 1 ? "Note" : "Notes"}
                </Text>
              </View>
            </View>
          )}

          {todaysEntries.length === 0 ? (
            <Text
              style={styles.emptyText}
              accessibilityLabel="No entries for selected date"
            >
              No entries for this date
            </Text>
          ) : (
            todaysEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryItem}
                onPress={() => handleEntryPress(entry.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Entry at ${entry.time}, tap to edit`}
                accessibilityHint="Opens edit screen for this entry"
              >
                <Text style={styles.entryTime}>{entry.time}</Text>
                <View style={styles.entryContent}>
                  <Text style={styles.entryIcon}>
                    {entry.type === "bowel_movement" 
                      ? "🚽" 
                      : entry.note 
                        ? NOTE_CATEGORY_CONFIG[entry.note.category].icon 
                        : "📝"}
                  </Text>
                  {entry.type === "bowel_movement" && entry.bowelMovement && (
                    <Text style={styles.entryDetails}>
                      Bristol: {entry.bowelMovement.consistency}, Urgency:{" "}
                      {entry.bowelMovement.urgency}
                    </Text>
                  )}
                  {entry.type === "note" && entry.note && (
                    <Text style={styles.entryDetails} numberOfLines={1}>
                      {entry.note.content}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Day Tag Manager Modal */}
        <DayTagManager
          date={selectedDate}
          visible={tagManagerVisible}
          onClose={() => setTagManagerVisible(false)}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  quickActions: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  recentEntries: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 16,
    marginTop: 20,
  },
  entryItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  entryTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  entryIcon: {
    fontSize: 24,
  },
  entryDetails: {
    fontSize: 14,
    color: "#1C1C1E",
    flex: 1,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
});
