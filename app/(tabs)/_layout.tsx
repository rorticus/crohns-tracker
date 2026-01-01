import useTheme from "@/hooks/useTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  useTabTrigger,
} from "expo-router/ui";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const safeArea = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Tabs>
      <TabSlot />
      <TabList
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          paddingTop: 8,
          paddingLeft: Math.max(8, safeArea.left),
          paddingRight: Math.max(8, safeArea.right),
          paddingBottom: Math.max(8, safeArea.bottom),
        }}
      >
        <TabTrigger name="home" href="/home">
          <Tab icon="home" title="Home" />
        </TabTrigger>
        <View style={{ flex: 1 }} />
        <TabTrigger name="timeline" href="/timeline">
          <Tab icon="stats-chart" title="Timeline" />
        </TabTrigger>
        <View style={{ flex: 1 }} />
        <CircleButton onPress={() => router.push("/new-entry")} />
        <View style={{ flex: 1 }} />
        <TabTrigger name="export" href="/export">
          <Tab icon="share-social" title="Export" />
        </TabTrigger>
        <Tab icon="settings" title="Settings" />
      </TabList>
    </Tabs>
  );
}

function Tab({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  const trigger = useTabTrigger({
    name: title.toLowerCase(),
  });
  const theme = useTheme();

  const color = trigger.triggerProps.isFocused
    ? theme.colors.primary
    : theme.colors.inactive;

  return (
    <View
      style={{
        padding: 12,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Ionicons name={icon} color={color} size={24} />
      <Text style={{ color }}>{title}</Text>
    </View>
  );
}

function CircleButton({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable style={{ alignItems: "center" }} onPress={onPress}>
      {/* Button */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.6,
          shadowRadius: 18,
          transform: [{ translateY: -24 }],
          opacity: 0.95,
        }}
      >
        <Ionicons name="add" color={theme.colors.text} size={32} />
      </View>
    </Pressable>
  );
}
