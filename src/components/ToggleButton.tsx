import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface ToggleButtonProps {
  active: boolean;
  onPress: () => void;
  activeIcon: string;
  inactiveIcon: string;
  activeLabel: string;
  inactiveLabel: string;
}

export default function ToggleButton({
  active,
  onPress,
  activeIcon,
  inactiveIcon,
  activeLabel,
  inactiveLabel,
}: ToggleButtonProps) {
  const currentIcon = active ? activeIcon : inactiveIcon;
  const currentLabel = active ? activeLabel : inactiveLabel;
  const iconColor = active ? Colors.white : Colors.gray500;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        active ? styles.buttonActive : styles.buttonInactive,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <FontAwesome
          name={currentIcon}
          size={32}
          color={iconColor}
        />
        <Text
          style={[
            styles.label,
            active ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {currentLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  buttonActive: {
    backgroundColor: Colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonInactive: {
    backgroundColor: Colors.gray300,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  labelActive: {
    color: Colors.white,
  },
  labelInactive: {
    color: Colors.text,
  },
});
