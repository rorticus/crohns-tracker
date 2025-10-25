import { Stack } from 'expo-router';

export default function EntryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#F2F2F7',
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="new"
        options={{
          title: 'New Entry',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}