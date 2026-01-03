import Button from "@/components/button";
import DateInput from "@/components/dateInput";
import Screen from "@/components/screen";
import { GradientSlider } from "@/components/slider";
import Text from "@/components/text";
import TimeInput from "@/components/timeInput";
import useTheme from "@/hooks/useTheme";
import {
  formatDateForDatabase,
  formatTimeForDatabase,
} from "@/utils/dateUtils";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";

const bristolScaleDescriptions: Record<number, string> = {
  1: "Separate hard lumps, like nuts (hard to pass)",
  2: "Sausage-shaped but lumpy",
  3: "Like a sausage but with cracks on the surface",
  4: "Like a sausage or snake, smooth and soft",
  5: "Soft blobs with clear-cut edges (passed easily)",
  6: "Fluffy pieces with ragged edges, a mushy stool",
  7: "Watery, no solid pieces (entirely liquid)",
};

const urgencyDescriptions: Record<number, string> = {
  1: "No urgency - could wait",
  2: "Mild urgency - some pressure",
  3: "Moderate urgency - needed soon",
  4: "Extreme urgency - couldn't wait",
};

const urgencyLabels: Record<number, string> = {
  1: "None",
  2: "Mild",
  3: "Moderate",
  4: "Extreme",
};

export default function NewEntry() {
  const theme = useTheme();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      type: "bowelMovement",
      date: formatDateForDatabase(new Date()),
      time: formatTimeForDatabase(new Date()),
      bristol: 4,
      urgency: 2,
    },
  });

  const type = form.watch("type");
  const bristolValue = form.watch("bristol");
  const urgencyValue = form.watch("urgency");

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerTitle: "New Entry",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView bounces={false} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 24,
              gap: 8,
            }}
          >
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <DateInput
                  fill
                  value={field.value}
                  onChange={field.onChange}
                  title="Event Date"
                />
              )}
            />
            <Controller
              name="time"
              control={form.control}
              render={({ field }) => (
                <TimeInput
                  fill
                  value={field.value}
                  onChange={field.onChange}
                  title="Event Time"
                />
              )}
            />
          </View>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 32,
                  gap: 8,
                }}
              >
                <Button
                  fill
                  title="Bowel Movement"
                  leftIcon={({ color, size }) => (
                    <FontAwesome5 name="toilet" size={size} color={color} />
                  )}
                  onPress={() => field.onChange("bowelMovement")}
                  selected={field.value === "bowelMovement"}
                />
                <Button
                  fill
                  title="Note"
                  leftIcon={({ color, size }) => (
                    <Ionicons name="calendar" size={size} color={color} />
                  )}
                  onPress={() => field.onChange("event")}
                  selected={field.value === "event"}
                />
              </View>
            )}
          />
          {type === "bowelMovement" && (
            <>
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
                  >
                    Bristol Stool Scale
                  </Text>
                  <View
                    style={{
                      backgroundColor: `${theme.colors.bm}66`,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}
                  >
                    <Text>Type {bristolValue}</Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    marginBottom: 28,
                  }}
                >
                  {bristolScaleDescriptions[bristolValue]}
                </Text>
                <Controller
                  control={form.control}
                  name="bristol"
                  render={({ field }) => (
                    <GradientSlider
                      value={field.value}
                      onValueChange={field.onChange}
                      minimumValue={1}
                      maximumValue={7}
                      minimumLabel="Type 1"
                      maximumLabel="Type 7"
                      gradientColors={theme.colors.bmSlider}
                    />
                  )}
                />
              </View>
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
                  >
                    Urgency Level
                  </Text>
                  <View
                    style={{
                      backgroundColor: `${theme.colors.urgency}66`,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}
                  >
                    <Text>{urgencyLabels[urgencyValue]}</Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    marginBottom: 28,
                  }}
                >
                  {urgencyDescriptions[urgencyValue]}
                </Text>
                <Controller
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <GradientSlider
                      value={field.value}
                      onValueChange={field.onChange}
                      minimumValue={1}
                      maximumValue={4}
                      minimumLabel={urgencyLabels[1]}
                      maximumLabel={urgencyLabels[4]}
                      gradientColors={theme.colors.urgencySlider}
                    />
                  )}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
