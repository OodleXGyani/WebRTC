import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCall } from '../contexts/CallContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Section from '../components/Section';
import InputField from '../components/InputField';
import Icon from '../components/Icon';
import ThemeToggle from '../components/ThemeToggle';
import { getColors, Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [isInitializing, setIsInitializing] = useState(true);
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const {
    userId,
    isSignalingConnected,
    incomingCallFrom,
    activeCallWith,
    targetUserId,
    setTargetUserId,
    callUser,
    signalingError,
    initError,
  } = useCall();

  /**
   * Initialize when screen loads
   */
  useFocusEffect(
    React.useCallback(() => {
      setIsInitializing(false);
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  /**
   * Handle incoming call - navigate to IncomingCallScreen
   */
  useEffect(() => {
    if (incomingCallFrom) {
      navigation.navigate('IncomingCall', { callerId: incomingCallFrom });
    }
  }, [incomingCallFrom, navigation]);

  /**
   * Handle active call - navigate to call screen
   */
  useEffect(() => {
    if (activeCallWith && !incomingCallFrom) {
      navigation.navigate('Create');
    }
  }, [activeCallWith, incomingCallFrom, navigation]);

  /**
   * Handle call action
   */
  const handleCall = async () => {
    if (!targetUserId.trim()) {
      Alert.alert('Error', 'Please enter a user ID to call');
      return;
    }

    if (targetUserId === userId) {
      Alert.alert('Error', "You can't call yourself");
      return;
    }

    try {
      await callUser(targetUserId);
      Alert.alert('Calling', `Calling ${targetUserId}...`);
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to call user: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Theme Toggle */}
        <View style={styles.headerTop}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>WebRTC Calling</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Direct peer-to-peer calling</Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Connection Status */}
        <Section>
          <Card>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isSignalingConnected
                        ? colors.success
                        : colors.danger,
                    },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {isSignalingConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>

              {signalingError && (
                <Text style={[styles.errorText, { color: colors.danger }]}>⚠️ {signalingError}</Text>
              )}
            </View>
          </Card>
        </Section>

        {/* Your User ID Section */}
        <Section title="Your ID">
          <Card>
            {userId ? (
              <View style={styles.userIdCard}>
                <Text style={styles.userIdLabel}>Your unique identifier:</Text>
                <View style={styles.userIdContainer}>
                  <Text style={styles.userId}>{userId}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      require('@react-native-clipboard/clipboard').default.setString(userId);
                      Alert.alert('Copied', 'Your ID copied to clipboard');
                    }}
                    style={styles.copyButton}
                  >
                    <Icon name="Copy" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.userIdNote}>
                  Share this ID with others so they can call you
                </Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.loadingText}>Initializing...</Text>
              </View>
            )}
          </Card>
        </Section>

        {/* WebRTC Error Display */}
        {initError && (
          <Section>
            <Card>
              <View style={styles.errorContainer}>
                <Text style={styles.errorAlertText}>⚠️ {initError}</Text>
              </View>
            </Card>
          </Section>
        )}

        {/* Call User Section */}
        <Section title="Call Someone">
          <Card>
            <InputField
              label="User ID to call"
              placeholder="Enter the user ID to call..."
              value={targetUserId}
              onChangeText={setTargetUserId}
              editable={isSignalingConnected && !isInitializing}
            />

            <Button
              title="Start Call"
              onPress={handleCall}
              icon="Phone"
              size="lg"
              fullWidth
              disabled={!isSignalingConnected || !userId || !targetUserId.trim()}
            />

            <Text style={styles.callNote}>
              {!isSignalingConnected
                ? 'Connecting to signaling server...'
                : 'Enter a user ID and tap Start Call to begin'}
            </Text>
          </Card>
        </Section>

        {/* Features Section */}
        <Section title="How It Works">
          <View style={styles.featuresList}>
            <FeatureItem
              icon="Zap"
              title="Direct Connection"
              description="Peer-to-peer video calling without intermediaries"
              colors={colors}
            />
            <FeatureItem
              icon="Users"
              title="Share Your ID"
              description="Give your unique ID to others so they can call you"
              colors={colors}
            />
            <FeatureItem
              icon="Video"
              title="Video & Audio"
              description="Crystal clear video and audio communication"
              colors={colors}
            />
            <FeatureItem
              icon="Lock"
              title="Secure"
              description="End-to-end encrypted peer-to-peer calls"
              colors={colors}
            />
          </View>
        </Section>

        {/* Legacy Manual Mode Section */}
        <Section title="Manual Mode (Developer)">
          <Card>
            <Text style={styles.legacyDescription}>
              Manual SDP offer/answer exchange for testing and debugging
            </Text>
            <View style={styles.legacyButtonsContainer}>
              <Button
                title="Create Call (Manual)"
                onPress={() => navigation.navigate('Create')}
                icon="PlusCircle"
                size="sm"
                variant="secondary"
                fullWidth
              />
              <Button
                title="Join Call (Manual)"
                onPress={() => navigation.navigate('Join')}
                icon="Link"
                size="sm"
                variant="secondary"
                fullWidth
              />
            </View>
          </Card>
        </Section>

        {/* Spacing */}
        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  colors,
}: {
  icon: string;
  title: string;
  description: string;
  colors: ReturnType<typeof getColors>;
}) {
  return (
    <Card>
      <View style={styles.featureContent}>
        <Icon name={icon} size={32} color={colors.primary} />
        <View style={styles.featureText}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 30,
    paddingHorizontal: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  header: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    flex: 1,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  statusContainer: {
    gap: Spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  errorText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  userIdCard: {
    gap: Spacing.md,
  },
  userIdLabel: {
    ...Typography.bodySmall,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  userId: {
    ...Typography.h3,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: Spacing.sm,
  },
  userIdNote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodySmall,
  },
  errorContainer: {
    borderLeftWidth: 4,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  errorAlertText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  callNote: {
    ...Typography.caption,
    marginTop: Spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.caption,
    lineHeight: 18,
  },
  legacyDescription: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  legacyButtonsContainer: {
    gap: Spacing.md,
  },
});
