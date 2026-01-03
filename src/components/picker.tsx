import useTheme from "@/hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import Text from "./text";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface PickerProps {
  items: string[];
  value?: string;
  onValueChange?: (value: string, index: number) => void;
}

function Picker({ items, value, onValueChange }: PickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isInitialMount = useRef(true);
  const theme = useTheme();

  // Scroll to initial value on mount
  useEffect(() => {
    if (value !== undefined && isInitialMount.current) {
      const index = items.indexOf(value);
      if (index !== -1) {
        setSelectedIndex(index);
        // Use setTimeout to ensure ScrollView is mounted
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }, 0);
      }
      isInitialMount.current = false;
    }
  }, [value, items]);

  // Update when value changes externally
  useEffect(() => {
    if (!isInitialMount.current && value !== undefined) {
      const index = items.indexOf(value);
      if (index !== -1 && index !== selectedIndex) {
        setSelectedIndex(index);
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
      }
    }
  }, [value, items, selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    if (index !== selectedIndex && index >= 0 && index < items.length) {
      setSelectedIndex(index);
      onValueChange?.(items[index], index);
    }
  };

  return (
    <View style={{ height: CONTAINER_HEIGHT, flex: 1 }}>
      {/* Selection indicator overlay */}
      <View
        style={{
          position: "absolute",
          top: ITEM_HEIGHT * 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, index) => (
          <View
            key={index}
            style={{
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                opacity: index === selectedIndex ? 1 : 0.3,
                fontSize: 20,
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default Picker;
