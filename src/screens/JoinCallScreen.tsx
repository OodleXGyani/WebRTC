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

export default function JoinCallScreen() {
  const {
    localStream,
    remoteStream,
    iceCandidates,
    createAnswer,
    addIceCandidate,
  } = useWebRTC();

  const [offerInput, setOfferInput] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [iceInput, setIceInput] = useState<string>('');

  const handleCreateAnswer = async () => {
    if (!offerInput) return;
    const sdp = await createAnswer(offerInput);
    if (sdp) setAnswer(sdp);
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

      <Text style={styles.title}>Paste Offer</Text>
      <TextInput
        style={styles.input}
        value={offerInput}
        onChangeText={setOfferInput}
        multiline
      />

      <Button title="Create Answer" onPress={handleCreateAnswer} />

      <Text style={styles.title}>Answer (copy & send)</Text>
      <TextInput
        style={styles.input}
        value={answer}
        multiline
        editable={false}
      />

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
