import Screen from "@/components/screen";
import Text from "@/components/text";
import useTheme from "@/hooks/useTheme";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function NewEntry() {
  const theme = useTheme();
  const router = useRouter();

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
      <Text>Hello</Text>
    </Screen>
  );
}
