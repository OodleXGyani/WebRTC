import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export default function Divider({ 
  style, 
  color = Colors.border,
  spacing = 'md',
}: DividerProps) {
  const spacingValue = {
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
  }[spacing];

  return (
    <View 
      style={[
        styles.divider,
        { 
          borderColor: color,
          marginVertical: spacingValue,
        },
        style,
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: 1,
  },
});
