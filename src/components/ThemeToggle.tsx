import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getColors, Spacing, BorderRadius } from '../constants/theme';
import Icon from './Icon';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityLabel="Toggle dark mode"
      accessibilityRole="button"
    >
      <Icon
        name={isDarkMode ? 'Sun' : 'Moon'}
        size={20}
        color={colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
