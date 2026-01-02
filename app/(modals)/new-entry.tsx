import Button from "@/components/button";
import DateInput from "@/components/dateInput";
import Screen from "@/components/screen";
import Text from "@/components/text";
import useTheme from "@/hooks/useTheme";
import { formatDateForDatabase } from "@/utils/dateUtils";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";

export default function NewEntry() {
  const theme = useTheme();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      type: "bowelMovement",
      date: formatDateForDatabase(new Date()),
    },
  });

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
              <DateInput value={field.value} onChange={field.onChange} />
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
                marginBottom: 24,
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
                title="Event"
                leftIcon={({ color, size }) => (
                  <Ionicons name="calendar" size={size} color={color} />
                )}
                onPress={() => field.onChange("event")}
                selected={field.value === "event"}
              />
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
