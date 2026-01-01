import useTheme from "@/hooks/useTheme";
import { Stack } from "expo-router";

export default function ModalLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    />
  );
}
