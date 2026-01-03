import useTheme from "@/hooks/useTheme";
import { TextInput, TextInputProps } from "react-native";

export default function TextArea(props: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      multiline
      numberOfLines={4}
      placeholderTextColor={theme.colors.inactive}
      style={[
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          padding: 12,
          borderRadius: 8,
          textAlignVertical: "top",
          height: 22 * 4,
          fontSize: 16,
        },
        props.style,
      ]}
      {...props}
    />
  );
}
