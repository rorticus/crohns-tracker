import useTheme from "@/hooks/useTheme";
import { Text as RNText, TextProps } from "react-native";

export default function Text(props: TextProps) {
  const theme = useTheme();

  return (
    <RNText {...props} style={[{ color: theme.colors.text }, props.style]} />
  );
}
