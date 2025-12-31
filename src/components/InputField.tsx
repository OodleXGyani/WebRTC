import React from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  editable?: boolean;
  maxHeight?: number;
  minHeight?: number;
  style?: ViewStyle;
  error?: string;
}

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  editable = true,
  maxHeight = 150,
  minHeight = 50,
  style,
  error,
}: InputFieldProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.disabled,
          error && styles.inputError,
          { minHeight, maxHeight },
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        editable={editable}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.bodySmall,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  disabled: {
    backgroundColor: Colors.surfaceLight,
    color: Colors.textSecondary,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
});
