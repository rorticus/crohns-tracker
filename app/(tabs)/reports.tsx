import Screen from "@/components/screen";
import Text from "@/components/text";
import TagReportCard from "@/components/tagReportCard";
import { getAllTagStatistics, TagStatistics } from "@/services/reportsService";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import useTheme from "@/hooks/useTheme";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function Reports() {
  const theme = useTheme();
  const [statistics, setStatistics] = useState<TagStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await getAllTagStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload statistics when screen comes into focus
  useFocusEffect(loadStatistics);

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
            Reports &amp; Insights
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
            Statistics for each experiment (day tag)
          </Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 16, color: theme.colors.textSecondary }}>
              Loading statistics...
            </Text>
          </View>
        ) : statistics.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
            <Ionicons
              name="stats-chart-outline"
              size={64}
              color={theme.colors.textSecondary}
              style={{ marginBottom: 16 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8, textAlign: "center" }}>
              No Data Yet
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: "center" }}>
              Add bowel movements and day tags to see experiment statistics here.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {statistics.map((stat) => (
              <TagReportCard key={stat.tagId} statistics={stat} />
            ))}

            {/* Footer info */}
            <View style={{ marginTop: 8, marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: "center" }}>
                Showing {statistics.length} experiment{statistics.length !== 1 ? 's' : ''} with data
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}
