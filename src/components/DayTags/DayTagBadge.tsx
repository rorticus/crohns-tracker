/**
 * Day Tag Badge Component
 *
 * Displays a tag with visual distinction between day tags (orange) and entry tags (blue).
 * Can be pressable for removal/interaction.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TAG_STYLES, type DayTagBadgeProps } from '../../types/dayTag';

export function DayTagBadge({
  tagName,
  isInherited = false,
  onPress,
  size = 'medium',
  testID,
}: DayTagBadgeProps) {
  const theme = isInherited ? TAG_STYLES.DAY_TAG : TAG_STYLES.ENTRY_TAG;
  const sizeStyle = TAG_STYLES.SIZES[size];

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.badge,
        {
          backgroundColor: theme.backgroundColor,
          borderColor: theme.borderColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          borderRadius: sizeStyle.borderRadius,
        },
      ]}
      testID={testID || 'day-tag-badge'}
      accessibilityLabel={`${isInherited ? 'Day' : 'Entry'} tag: ${tagName}`}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.textColor,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {tagName}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  text: {
    fontWeight: '500',
  },
});
