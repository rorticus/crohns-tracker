import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  pressable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = true,
  pressable = false,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    elevated && styles.elevated,
    style,
  ];

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        accessible={true}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});