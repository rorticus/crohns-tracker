import useTheme from "@/hooks/useTheme";
import { Pressable } from "react-native";
import Text from "./text";

type ButtonProps = {
  title: string;
  leftIcon?: (props: { color: string; size: number }) => React.ReactNode;
  rightIcon?: (props: { color: string; size: number }) => React.ReactNode;
  onPress?: () => void;

  fill?: boolean;

  type?: "default" | "selected" | "primary";
};

export default function Button({
  title,
  leftIcon,
  rightIcon,
  onPress,

  fill,
  type = "default",
}: ButtonProps) {
  const theme = useTheme();

  const defaultColor =
    type === "primary" ? theme.colors.background : `${theme.colors.accent}99`;
  const backgroundColor =
    type === "primary" ? theme.colors.primary : theme.colors.card;
  const borderColor =
    type === "selected"
      ? theme.colors.primary
      : type === "primary"
      ? defaultColor
      : defaultColor;

  const shadowProps =
    type === "primary"
      ? {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }
      : {};

  return (
    <Pressable
      style={{
        padding: 12,
        backgroundColor: backgroundColor,
        borderWidth: 1,
        borderColor,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flex: fill ? 1 : undefined,
        ...shadowProps,
      }}
      onPress={onPress}
    >
      {leftIcon?.({
        color: type === "selected" ? theme.colors.primary : defaultColor,
        size: 16,
      })}
      <Text
        style={{
          color: type === "selected" ? theme.colors.primary : defaultColor,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        {title}
      </Text>

      {rightIcon?.({
        color: type === "selected" ? theme.colors.primary : defaultColor,
        size: 16,
      })}
    </Pressable>
  );
}
