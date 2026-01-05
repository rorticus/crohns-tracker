import EntryForm, { EntryFormData } from "@/components/entryForm";
import Screen from "@/components/screen";
import Text from "@/components/text";
import useTheme from "@/hooks/useTheme";
import { createBowelMovement, createNote } from "@/services/entryService";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function NewEntry() {
  const theme = useTheme();
  const router = useRouter();

  async function onSave(values: EntryFormData) {
    console.log(values);

    try {
      if (values.type === "bowelMovement") {
        await createBowelMovement({
          date: values.date,
          time: values.time,
          consistency: values.bristol,
          urgency: values.urgency,
          notes: values.notes,
        });
      } else {
        await createNote({
          date: values.date,
          time: values.time,
          category: values.category,
          content: values.notes,
        });
      }

      router.back();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  }

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
      <EntryForm onSave={onSave} />
    </Screen>
  );
}
