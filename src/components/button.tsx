import useTheme from "@/hooks/useTheme";
import { Pressable } from "react-native";
import Text from "./text";

type ButtonProps = {
  title: string;
  leftIcon?: (props: { color: string; size: number }) => React.ReactNode;
  rightIcon?: (props: { color: string; size: number }) => React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  fill?: boolean;
};

export default function Button({
  title,
  leftIcon,
  rightIcon,
  onPress,
  selected,
  fill,
}: ButtonProps) {
  const theme = useTheme();

  const defaultColor = `${theme.colors.accent}99`;

  return (
    <Pressable
      style={{
        padding: 12,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : defaultColor,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flex: fill ? 1 : undefined,
      }}
      onPress={onPress}
    >
      {leftIcon?.({
        color: selected ? theme.colors.primary : defaultColor,
        size: 16,
      })}
      <Text
        style={{
          color: selected ? theme.colors.primary : defaultColor,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        {title}
      </Text>

      {rightIcon?.({
        color: selected ? theme.colors.primary : defaultColor,
        size: 16,
      })}
    </Pressable>
  );
}
