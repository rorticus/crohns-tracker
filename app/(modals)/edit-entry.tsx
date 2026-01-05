import EntryForm, { EntryFormData } from "@/components/entryForm";
import Screen from "@/components/screen";
import Text from "@/components/text";
import useEntryById from "@/hooks/useEntryById";
import useTheme from "@/hooks/useTheme";
import { updateBowelMovement, updateNote } from "@/services/entryService";
import { BristolScale, UrgencyLevel } from "@/types/entry";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function EditEntry() {
  const theme = useTheme();
  const router = useRouter();
  const { id: entryId } = useLocalSearchParams<{ id: string }>();
  const entryIdNumber = Number(entryId);
  const entry = useEntryById(entryIdNumber);

  async function onSave(values: EntryFormData) {
    console.log(values);

    try {
      if (values.type === "bowelMovement") {
        await updateBowelMovement(entryIdNumber, {
          date: values.date,
          time: values.time,
          consistency: values.bristol,
          urgency: values.urgency,
          notes: values.notes,
        });
      } else {
        await updateNote(entryIdNumber, {
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
          headerTitle: "Update Entry",
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
      {entry.data.length > 0 && (
        <EntryForm
          key={entry.data[0].entry.id}
          onSave={onSave}
          defaultValues={{
            type:
              entry.data[0].entry.type === "bowel_movement"
                ? "bowelMovement"
                : "event",
            date: entry.data[0].entry.date,
            time: entry.data[0].entry.time,
            bristol: (entry.data[0].bowelMovement?.consistency ??
              4) as BristolScale,
            urgency: (entry.data[0].bowelMovement?.urgency ??
              2) as UrgencyLevel,
            category: entry.data[0].note?.category ?? "medication",
            notes: entry.data[0].note?.content ?? "",
          }}
        />
      )}
    </Screen>
  );
}
