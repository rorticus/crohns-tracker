import { ModalProvider } from "@/hooks/useIsModal";
import useTheme from "@/hooks/useTheme";
import { Stack } from "expo-router";

export default function ModalLayout() {
  const theme = useTheme();

  return (
    <ModalProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
        }}
      />
    </ModalProvider>
  );
}
