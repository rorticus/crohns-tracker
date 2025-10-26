import { Stack } from "expo-router";

export default function EntryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="new"
        options={{
          title: "New Entry",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
