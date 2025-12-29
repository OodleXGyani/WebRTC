import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';

import { useWebRTC } from '../webrtc/useWebRTC';

export default function CreateOfferScreen() {
  const {
    localStream,
    remoteStream,
    iceCandidates,
    createOffer,
    applyAnswer,
    addIceCandidate,
  } = useWebRTC();

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.video}
        />
      )}

      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.video}
        />
      )}

      <Button title="Create Offer" onPress={handleCreateOffer} />

      <Text style={styles.title}>Offer (copy & send)</Text>
      <TextInput
        style={styles.input}
        value={offer}
        multiline
        editable={false}
      />

      <Text style={styles.title}>Paste Answer</Text>
      <TextInput
        style={styles.input}
        value={answerInput}
        onChangeText={setAnswerInput}
        multiline
      />

      <Button title="Apply Answer" onPress={handleApplyAnswer} />

      <Text style={styles.title}>ICE Candidates (send)</Text>
      {iceCandidates.map((candidate, index) => (
        <Text key={index} style={styles.iceText}>
          {candidate}
        </Text>
      ))}

      <TextInput
        style={styles.input}
        value={iceInput}
        onChangeText={setIceInput}
        multiline
        placeholder="Paste ICE candidate"
      />

      <Button title="Add ICE Candidate" onPress={handleAddIce} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    marginBottom: 10,
  },
  title: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  iceText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
