import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useCall } from '../contexts/CallContext';
import { useTheme } from '../contexts/ThemeContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ThemeToggle from '../components/ThemeToggle';
import { getColors, Spacing, Typography, BorderRadius } from '../constants/theme';

type IncomingCallScreenRouteProp = RouteProp<
  { IncomingCall: { callerId: string } },
  'IncomingCall'
>;

export default function IncomingCallScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<IncomingCallScreenRouteProp>();
  const callerId = route.params?.callerId;
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const {
    incomingCallFrom,
    activeCallWith,
    acceptCall,
    rejectCall,
  } = useCall();

  /**
   * Navigate to call screen when call is accepted
   */
  useEffect(() => {
    if (activeCallWith) {
      navigation.replace('Create');
    }
  }, [activeCallWith, navigation]);

  /**
   * Go back if no incoming call
   */
  useEffect(() => {
    if (!incomingCallFrom && !callerId) {
      navigation.goBack();
    }
  }, [incomingCallFrom, callerId, navigation]);

  /**
   * Handle accept call
   */
  const handleAccept = async () => {
    try {
      await acceptCall();
    } catch (error) {
      console.error('[IncomingCallScreen] Failed to accept call:', error);
    }
  };

  /**
   * Handle reject call
   */
  const handleReject = () => {
    rejectCall();
    navigation.goBack();
  };

  const displayCallerId = callerId || incomingCallFrom || 'Unknown';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Theme Toggle */}
        <View style={styles.themeToggleContainer}>
          <ThemeToggle />
        </View>
        {/* Caller Info */}
        <View style={styles.callerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <FontAwesome name="phone" size={64} color={colors.white} />
          </View>

          <Text style={[styles.incomingText, { color: colors.textSecondary }]}>Incoming Call</Text>
          <Text style={[styles.callerId, { color: colors.primary }]}>{displayCallerId}</Text>
          <Text style={[styles.callerNote, { color: colors.textSecondary }]}>is calling...</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          {/* Accept Button */}
          <TouchableOpacity
            onPress={handleAccept}
            style={[styles.actionButton, styles.acceptButton, { backgroundColor: colors.success }]}
          >
            <FontAwesome name="phone" size={40} color={colors.white} />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>

          {/* Reject Button */}
          <TouchableOpacity
            onPress={handleReject}
            style={[styles.actionButton, styles.rejectButton, { backgroundColor: colors.danger }]}
          >
            <FontAwesome name="phone-slash" size={40} color={colors.white} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>

        {/* Caller ID info */}
        <View style={[styles.infoSection, { backgroundColor: colors.surfaceLight, borderLeftColor: colors.primary }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            The caller's ID: <Text style={[styles.infoValue, { color: colors.primary }]}>{displayCallerId}</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  themeToggleContainer: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  callerSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  incomingText: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  callerId: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  callerNote: {
    ...Typography.body,
    fontStyle: 'italic',
  },
  buttonsSection: {
    flexDirection: 'row',
    gap: Spacing.xl,
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Spacing.xl,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  acceptButton: {
  },
  rejectButton: {
  },
  actionButtonText: {
    ...Typography.caption,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  infoSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    width: '100%',
  },
  infoText: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  infoValue: {
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
