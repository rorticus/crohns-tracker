import useTheme from "@/hooks/useTheme";
import { formatTimeForDisplay } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Button from "./button";
import Card from "./card";
import Picker from "./picker";
import Text from "./text";

type TimeInputProps = {
  value: string;
  onChange: (newTime: string) => void;
  fill?: boolean;
  title?: string;
};

export default function TimeInput({
  value,
  fill,
  onChange,
  title,
}: TimeInputProps) {
  const theme = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hour, setHour] = useState("1");
  const [minute, setMinute] = useState("30");
  const [suffix, setSuffix] = useState("AM");

  return (
    <>
      <Modal
        transparent={true}
        animationType="fade"
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000099",
            padding: 16,
          }}
        >
          <Card>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {title ?? "Set Time"}
              </Text>
              <Pressable style={{}} onPress={() => setShowTimePicker(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                  onPress={() => setShowTimePicker(false)}
                />
              </Pressable>
            </View>

            <View
              style={{
                height: 180,
                flexDirection: "row",
                padding: 8,
                backgroundColor: theme.colors.background,
                overflow: "hidden",
                marginBottom: 16,
                borderRadius: 16,
              }}
            >
              {showTimePicker && (
                <>
                  <Picker
                    value={hour}
                    items={Array(12)
                      .fill("")
                      .map((_, i) => String(i + 1))}
                    onValueChange={setHour}
                  />
                  <Picker
                    value={minute}
                    items={Array(60)
                      .fill("")
                      .map((_, i) => String(i).padStart(2, "0"))}
                    onValueChange={setMinute}
                  />
                  <Picker
                    value={suffix}
                    items={["AM", "PM"]}
                    onValueChange={setSuffix}
                  />
                </>
              )}
            </View>
            <Button
              title="Confirm"
              onPress={() => {
                let hour24 = parseInt(hour);
                if (suffix === "PM" && hour24 !== 12) {
                  hour24 += 12;
                } else if (suffix === "AM" && hour24 === 12) {
                  hour24 = 0;
                }
                const newTime = `${String(hour24).padStart(2, "0")}:${minute}`;
                onChange(newTime);
                setShowTimePicker(false);
              }}
            />
          </Card>
        </View>
      </Modal>
      <Button
        fill={fill}
        title={!value ? "Not Selected" : formatTimeForDisplay(value)}
        leftIcon={({ color, size }) => (
          <Ionicons name="time" size={size} color={color} />
        )}
        onPress={() => {
          const [hour, minute] = value.split(":").map(Number);
          let hour12 = hour;
          let suffix = "AM";
          if (hour === 0) {
            hour12 = 12;
            suffix = "AM";
          } else if (hour === 12) {
            hour12 = 12;
            suffix = "PM";
          } else if (hour > 12) {
            hour12 = hour - 12;
            suffix = "PM";
          } else {
            suffix = "AM";
          }
          setHour(String(hour12));
          setMinute(String(minute).padStart(2, "0"));
          setSuffix(suffix);
          setShowTimePicker(true);
        }}
      />
    </>
  );
}
