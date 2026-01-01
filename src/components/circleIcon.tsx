import { ReactNode } from "react";
import { View } from "react-native";

export default function CircleIcon({
  color,
  icon,
}: {
  color: string;
  icon: ({ color, size }: { color: string; size: number }) => ReactNode;
}) {
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${color}33`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon({ color, size: 24 })}
    </View>
  );
}
