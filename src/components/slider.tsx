import useTheme from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useMemo } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface GradientSliderProps {
  /** Minimum value */
  minimumValue?: number;
  /** Maximum value */
  maximumValue?: number;
  /** Initial value */
  value?: number;
  /** Callback when value changes */
  onValueChange?: (value: number) => void;
  /** Label for minimum value */
  minimumLabel?: string;
  /** Label for maximum value */
  maximumLabel?: string;
  /** Gradient colors (left to right) */
  gradientColors?: string[];
  /** Thumb color */
  thumbColor?: string;
  /** Track height */
  /** Step increment (0 for continuous) */
  step?: number;
}

const trackHeight = 8;
const thumbSize = 22;

export const GradientSlider: React.FC<GradientSliderProps> = ({
  minimumValue = 0,
  maximumValue = 100,
  value: initialValue = 0,
  onValueChange,
  minimumLabel = "None",
  maximumLabel = "Emergency",
  gradientColors = ["#FFD93D", "#FF8C42", "#FF6B35"],
  step = 0,
}) => {
  const [value, setValue] = useState(initialValue);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();

  // Use refs to avoid stale closures in PanResponder
  const valueRef = useRef(value);
  const trackWidthRef = useRef(trackWidth);
  const panGestureStartValue = useRef(0);

  // Keep refs in sync
  valueRef.current = value;
  trackWidthRef.current = trackWidth;

  const thumbColor = theme.colors.text;

  const valueToPosition = (val: number, width: number): number => {
    const percentage = (val - minimumValue) / (maximumValue - minimumValue);
    return percentage * width;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setIsDragging(true);
          panGestureStartValue.current = valueRef.current;
        },
        onPanResponderMove: (
          _event: GestureResponderEvent,
          gestureState: PanResponderGestureState
        ) => {
          const width = trackWidthRef.current;
          if (width === 0) return;

          // Calculate position from value
          const startVal = panGestureStartValue.current;
          const startPercentage = (startVal - minimumValue) / (maximumValue - minimumValue);
          const startPosition = startPercentage * width;

          // Calculate new position
          const newPosition = Math.max(
            0,
            Math.min(width, startPosition + gestureState.dx)
          );

          // Convert position back to value
          const percentage = Math.max(0, Math.min(1, newPosition / width));
          let newValue = minimumValue + percentage * (maximumValue - minimumValue);

          if (step > 0) {
            newValue = Math.round(newValue / step) * step;
          }

          newValue = Math.floor(Math.max(minimumValue, Math.min(maximumValue, newValue)));

          setValue(newValue);
          onValueChange?.(newValue);
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      }),
    [minimumValue, maximumValue, step, onValueChange]
  );

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const thumbPosition = valueToPosition(value, trackWidth);
  console.log("thumbPosition", thumbPosition);

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer} onLayout={handleTrackLayout}>
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            { height: trackHeight, borderRadius: trackHeight / 2 },
          ]}
        />

        <View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              left: thumbPosition,
              width: thumbSize,
              height: thumbSize,
              backgroundColor: thumbColor,
              transform: [{ scale: isDragging ? 1.1 : 1 }],
            },
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>

      <View style={styles.labelsContainer}>
        <Text style={styles.label}>{minimumLabel}</Text>
        <Text style={styles.label}>{maximumLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
  },
  trackContainer: {
    width: "100%",
    justifyContent: "center",
    marginBottom: 12,
  },
  gradient: {
    width: "100%",
  },
  thumb: {
    position: "absolute",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginLeft: -11, // Half of thumb size for centering
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FF8C42",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
