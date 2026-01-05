import useTheme from "@/hooks/useTheme";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

export default function Card({
  children,
  leftIcon,
  rightIcon,
  onPress,
}: {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      style={{
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
      }}
      onPress={onPress}
    >
      {leftIcon}
      <View style={{ flex: 1 }}>{children}</View>
      {rightIcon}
    </Pressable>
  );
}
