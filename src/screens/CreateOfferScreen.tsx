import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { RTCView } from 'react-native-webrtc';
import { useCall } from '../contexts/CallContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Section from '../components/Section';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToggleButton from '../components/ToggleButton';
import ThemeToggle from '../components/ThemeToggle';
import { getColors, Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export default function CreateOfferScreen() {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const {
    localStream,
    remoteStream,
    iceCandidates,
    createOffer,
    applyAnswer,
    addIceCandidate,
    toggleMic,
    toggleCamera,
    endCall,
    isMicOn,
    isCamOn,
    initError,
  } = useCall();

  // Local state for manual SDP exchange
  const [offer, setOffer] = useState<string>('');
  const [answerInput, setAnswerInput] = useState<string>('');
  const [iceInput, setIceInput] = useState<string>('');

  const handleCreateOffer = async () => {
    const sdp = await createOffer();
    if (sdp) setOffer(sdp);
  };

  const handleApplyAnswer = async () => {
    if (!answerInput) return;
    await applyAnswer(answerInput);
  };

  const handleAddIce = async () => {
    if (!iceInput) return;
    await addIceCandidate(iceInput);
    setIceInput('');
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Success', `${label} copied to clipboard`);
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
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Create Call (Manual Mode)</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Manual SDP offer/answer exchange</Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Error Display */}
        {initError && (
          <Card>
            <View style={[styles.errorContainer, { borderLeftColor: colors.danger }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>⚠️ {initError}</Text>
            </View>
          </Card>
        )}

        {/* Video Section */}
        {(localStream || remoteStream) && (
          <Section title="Video Stream">
            <View style={styles.videoContainer}>
              {localStream && localStream.getTracks?.().length > 0 ? (
                <Card noPadding>
                  <RTCView
                    streamURL={localStream.toURL()}
                    style={styles.video}
                  />
                  <Text style={styles.videoLabel}>Your Camera</Text>
                </Card>
              ) : (
                <Card noPadding>
                  <View style={[styles.videoPlaceholder, { backgroundColor: colors.surfaceLight }]}>
                    <Text style={[styles.videoPlaceholderText, { color: colors.textSecondary }]}>
                      Camera unavailable on emulator. Test on a physical device.
                    </Text>
                  </View>
                  <Text style={[styles.videoLabel, { color: colors.textSecondary, backgroundColor: colors.surfaceLight }]}>Your Camera</Text>
                </Card>
              )}

              {remoteStream && remoteStream.getTracks?.().length > 0 && (
                <Card noPadding>
                  <RTCView
                    streamURL={remoteStream.toURL()}
                    style={styles.video}
                  />
                  <Text style={[styles.videoLabel, { color: colors.textSecondary, backgroundColor: colors.surfaceLight }]}>Remote Stream</Text>
                </Card>
              )}
            </View>
          </Section>
        )}

        {/* Controls Section */}
        <Section title="Call Controls">
          <View style={styles.controls}>
            <ToggleButton
              active={isMicOn}
              onPress={toggleMic}
              activeIcon="microphone"
              inactiveIcon="microphone-slash"
              activeLabel="Mic On"
              inactiveLabel="Mic Off"
            />

            <ToggleButton
              active={isCamOn}
              onPress={toggleCamera}
              activeIcon="video-camera"
              inactiveIcon="video-slash"
              activeLabel="Cam On"
              inactiveLabel="Cam Off"
            />

            <TouchableOpacity
              onPress={endCall}
              style={[styles.controlBtn, styles.controlBtnDanger, { backgroundColor: colors.danger }]}
            >
              <FontAwesome
                name="phone-slash"
                size={32}
                color={colors.white}
              />
              <Text style={styles.controlLabel}>End</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Create Offer Section */}
        <Section title="Step 1: Create Offer">
          <Card>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Click the button below to generate an offer. Share the offer text with the person you want to call.
            </Text>
            <Button
              title="Generate Offer"
              onPress={handleCreateOffer}
              fullWidth
              icon="link"
            />
          </Card>
        </Section>

        {/* Offer Display */}
        {offer && (
          <Section title="Your Offer (Share This)">
            <Card>
              <View style={styles.copyRow}>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  Copy and send this to the other person
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(offer, 'Offer')}
                  style={styles.copyButtonContainer}
                >
                  <FontAwesome
                    name="copy"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.copyButton, { color: colors.primary }]}>Copy</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={offer}
                multiline
                editable={false}
              />
            </Card>
          </Section>
        )}

        {/* Answer Input Section */}
        <Section title="Step 2: Paste Answer">
          <Card>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Paste the answer from the other person here
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={answerInput}
              onChangeText={setAnswerInput}
              multiline
              placeholder="Paste the answer here..."
              placeholderTextColor={colors.textLight}
            />
            <Button
              title="Apply Answer"
              onPress={handleApplyAnswer}
              fullWidth
              variant="secondary"
              disabled={!answerInput}
            />
          </Card>
        </Section>

        {/* ICE Candidates Section */}
        <Section title={`Step 3: ICE Candidates (${iceCandidates.length})`}>
          <Card>
            {iceCandidates.length > 0 ? (
              <>
                <View style={styles.copyRow}>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    {iceCandidates.length} candidate{iceCandidates.length !== 1 ? 's' : ''} found
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(iceCandidates.join('\n'), 'ICE candidates')
                    }
                    style={styles.copyButtonContainer}
                  >
                    <FontAwesome
                      name="copy"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={[styles.copyButton, { color: colors.primary }]}>Copy All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.candidatesList}>
                  {iceCandidates.slice(0, 5).map((candidate, index) => (
                    <View key={index} style={[styles.candidateItem, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.candidateNumber, { color: colors.textSecondary }]}>{index + 1}.</Text>
                      <Text style={[styles.candidateText, { color: colors.text }]} numberOfLines={2}>
                        {candidate.substring(0, 50)}...
                      </Text>
                    </View>
                  ))}
                  {iceCandidates.length > 5 && (
                    <Text style={[styles.moreText, { color: colors.primary }]}>
                      +{iceCandidates.length - 5} more candidates
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
                ICE candidates will appear here once connection starts
              </Text>
            )}

            <Text style={[styles.inputLabel, { color: colors.text }]}>Add ICE Candidate</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={iceInput}
              onChangeText={setIceInput}
              multiline
              placeholder="Paste ICE candidate here..."
              placeholderTextColor={colors.textLight}
            />
            <Button
              title="Add Candidate"
              onPress={handleAddIce}
              fullWidth
              disabled={!iceInput}
            />
          </Card>
        </Section>

        {/* Navigation Section */}
        <Section>
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Home')}
            variant="ghost"
            fullWidth
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
  },
  videoContainer: {
    gap: Spacing.md,
  },
  video: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.black,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  videoPlaceholder: {
    width: '100%',
    height: 240,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  videoPlaceholderText: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  videoLabel: {
    ...Typography.caption,
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  controlBtnDanger: {
  },
  controlLabel: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  stepDescription: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  copyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  copyButton: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  input: {
    minHeight: 100,
    maxHeight: 150,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    textAlignVertical: 'top',
    ...Typography.bodySmall,
  },
  inputLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  candidatesList: {
    marginBottom: Spacing.md,
  },
  candidateItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  candidateNumber: {
    ...Typography.caption,
    fontWeight: '600',
    marginRight: Spacing.sm,
    minWidth: 20,
  },
  candidateText: {
    ...Typography.caption,
    flex: 1,
  },
  moreText: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderLeftWidth: 4,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});
