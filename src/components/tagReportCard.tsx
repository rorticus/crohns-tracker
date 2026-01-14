import useTheme from "@/hooks/useTheme";
import { TagStatistics, getBristolScaleDescription, getBristolScaleColor, getBristolScaleIconName } from "@/services/reportsService";
import { View } from "react-native";
import Text from "./text";
import { Ionicons } from "@expo/vector-icons";

interface TagReportCardProps {
  statistics: TagStatistics;
}

export default function TagReportCard({ statistics }: TagReportCardProps) {
  const theme = useTheme();

  // Format date range
  const formatDateRange = () => {
    if (!statistics.dateRange.earliest || !statistics.dateRange.latest) {
      return "No dates";
    }

    const earliest = new Date(statistics.dateRange.earliest).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const latest = new Date(statistics.dateRange.latest).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${earliest} - ${latest}`;
  };

  // Get most common consistency
  const getMostCommonConsistency = () => {
    const entries = Object.entries(statistics.consistencyDistribution);
    if (entries.length === 0) return null;

    const sorted = entries.sort(([, a], [, b]) => b - a);
    const [scale, count] = sorted[0];
    return { scale: parseInt(scale), count };
  };

  const mostCommon = getMostCommonConsistency();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
          {statistics.tagDisplayName}
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
          {formatDateRange()}
        </Text>
      </View>

      {/* Key Metrics Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <MetricBox
          label="Total Days"
          value={statistics.totalDays.toString()}
          iconName="calendar-outline"
        />
        <MetricBox
          label="Total Entries"
          value={statistics.totalBowelMovements.toString()}
          iconName="bar-chart-outline"
        />
        <MetricBox
          label="Avg per Day"
          value={statistics.averageBowelMovementsPerDay.toFixed(1)}
          iconName="trending-up-outline"
        />
        <MetricBox
          label="Avg Bristol"
          value={statistics.averageConsistency.toFixed(1)}
          iconName={getBristolScaleIconName(Math.round(statistics.averageConsistency))}
          iconColor={getBristolScaleColor(Math.round(statistics.averageConsistency))}
        />
      </View>

      {/* Most Common Consistency */}
      {mostCommon && (
        <View
          style={{
            backgroundColor: theme.colors.background,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>
            Most Common Bristol Scale
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name={getBristolScaleIconName(mostCommon.scale)}
              size={24}
              color={getBristolScaleColor(mostCommon.scale)}
            />
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {mostCommon.scale}
            </Text>
            <Text style={{ flex: 1, fontSize: 14 }}>
              {getBristolScaleDescription(mostCommon.scale)}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.textSecondary }}>
              {mostCommon.count}x
            </Text>
          </View>
        </View>
      )}

      {/* Bristol Scale Distribution */}
      {Object.keys(statistics.consistencyDistribution).length > 0 && (
        <View>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 }}>
            Bristol Scale Distribution
          </Text>
          <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(statistics.consistencyDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([scale, count]) => {
                const scaleNum = parseInt(scale);
                return (
                  <View
                    key={scale}
                    style={{
                      backgroundColor: theme.colors.background,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name={getBristolScaleIconName(scaleNum)}
                      size={16}
                      color={getBristolScaleColor(scaleNum)}
                    />
                    <Text style={{ fontSize: 12, fontWeight: "600" }}>
                      {scale}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                      ({count})
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>
      )}

      {/* Urgency Distribution */}
      {Object.keys(statistics.urgencyDistribution).length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 }}>
            Urgency Distribution
          </Text>
          <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(statistics.urgencyDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, count]) => {
                const urgencyLabels: Record<string, string> = {
                  "1": "None",
                  "2": "Mild",
                  "3": "Moderate",
                  "4": "Urgent",
                };
                return (
                  <View
                    key={level}
                    style={{
                      backgroundColor: theme.colors.background,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>
                      {urgencyLabels[level]}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: "600" }}>
                      {count}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>
      )}
    </View>
  );
}

// Helper component for metric boxes
function MetricBox({
  label,
  value,
  iconName,
  iconColor
}: {
  label: string;
  value: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: "45%",
        backgroundColor: theme.colors.background,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      <Ionicons
        name={iconName}
        size={28}
        color={iconColor || theme.colors.primary}
        style={{ marginBottom: 4 }}
      />
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}
