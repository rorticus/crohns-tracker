import db from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import migrations from "../drizzle/migrations";

export default function RootLayout() {
  useMigrations(db, migrations);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="entry"
          options={{
            presentation: "modal",
            headerTitle: "Entry",
          }}
        />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
