import useTheme from "@/hooks/useTheme";
import { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

const TextArea = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const theme = useTheme();

  return (
    <TextInput
      ref={ref}
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
});

TextArea.displayName = "TextArea";

export default TextArea;
