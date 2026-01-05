import Button from "@/components/button";
import DateInput from "@/components/dateInput";
import { GradientSlider } from "@/components/slider";
import Text from "@/components/text";
import TextArea from "@/components/textarea";
import TimeInput from "@/components/timeInput";
import useTheme from "@/hooks/useTheme";
import { BristolScale, NoteCategory, UrgencyLevel } from "@/types/entry";
import {
  formatDateForDatabase,
  formatTimeForDatabase,
} from "@/utils/dateUtils";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

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

export type EntryFormData = {
  type: "bowelMovement" | "event";
  date: string;
  time: string;
  bristol: BristolScale;
  urgency: UrgencyLevel;
  notes: string;
  category: NoteCategory;
};

type EntryFormProps = {
  onSave: (data: EntryFormData) => Promise<void>;
};

export default function EntryForm({ onSave }: EntryFormProps) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const form = useForm<EntryFormData>({
    defaultValues: {
      type: "bowelMovement",
      date: formatDateForDatabase(new Date()),
      time: formatTimeForDatabase(new Date()),
      bristol: 4,
      urgency: 2,
      notes: "",
      category: "medication",
    },
  });

  const type = form.watch("type");
  const bristolValue = form.watch("bristol");
  const urgencyValue = form.watch("urgency");

  useEffect(() => {
    const listener = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    return () => listener.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ paddingHorizontal: 16, flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // adjust if you have a header
    >
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        style={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
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
                  title="Bowel Movement"
                  leftIcon={({ color, size }) => (
                    <FontAwesome5 name="toilet" size={size} color={color} />
                  )}
                  onPress={() => field.onChange("bowelMovement")}
                  type={
                    field.value === "bowelMovement" ? "selected" : "default"
                  }
                />
                <Button
                  title="Note"
                  leftIcon={({ color, size }) => (
                    <Ionicons name="calendar" size={size} color={color} />
                  )}
                  onPress={() => field.onChange("event")}
                  type={field.value === "event" ? "selected" : "default"}
                />
              </View>
            )}
          />
          <View style={{ marginBottom: 32 }}>
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
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 8,
                      }}
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
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 8,
                      }}
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
            {type === "event" && (
              <View
                style={{
                  marginBottom: 32,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <Button
                        leftIcon={({ color, size }) => (
                          <Ionicons
                            name="fast-food"
                            size={size}
                            color={color}
                          />
                        )}
                        title="Food"
                        onPress={() => field.onChange("food")}
                        type={field.value === "food" ? "selected" : "default"}
                      />
                      <Button
                        leftIcon={({ color, size }) => (
                          <Ionicons name="bicycle" size={size} color={color} />
                        )}
                        title="Exercise"
                        onPress={() => field.onChange("exercise")}
                        type={
                          field.value === "exercise" ? "selected" : "default"
                        }
                      />
                      <Button
                        leftIcon={({ color, size }) => (
                          <FontAwesome5
                            name="pills"
                            size={size}
                            color={color}
                          />
                        )}
                        title="Medication"
                        onPress={() => field.onChange("medication")}
                        type={
                          field.value === "medication" ? "selected" : "default"
                        }
                      />
                      <Button
                        leftIcon={({ color, size }) => (
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={size}
                            color={color}
                          />
                        )}
                        title="Other"
                        onPress={() => field.onChange("other")}
                        type={field.value === "other" ? "selected" : "default"}
                      />
                    </View>
                  )}
                />
              </View>
            )}
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Notes
              </Text>
              <Controller
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <TextArea
                    placeholder="Additional notes (optional)"
                    value={field.value}
                    onChangeText={field.onChange}
                    numberOfLines={4}
                  />
                )}
              />
            </View>
          </View>
          <Button
            title="Save Entry"
            rightIcon={({ color, size }) => (
              <Ionicons name="arrow-forward" color={color} size={size} />
            )}
            type="primary"
            onPress={form.handleSubmit(onSave)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
