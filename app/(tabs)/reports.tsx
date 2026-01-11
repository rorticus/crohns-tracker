import Screen from "@/components/screen";
import Text from "@/components/text";
import { View } from "react-native";

export default function Reports() {
  return (
    <Screen>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 32 }}>
          Reports &amp; Insights
        </Text>
      </View>
    </Screen>
  );
}
