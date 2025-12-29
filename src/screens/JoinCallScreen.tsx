import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';

import Clipboard from '@react-native-clipboard/clipboard';
import { View, TouchableOpacity, Alert } from 'react-native';


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

  const copyToClipboard = (text: string, label: string) => {
  Clipboard.setString(text);
  Alert.alert('Copied', `${label} copied to clipboard`);
};


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

      <View style={styles.row}>
        <Text style={styles.title}>Answer (copy & send)</Text>
        {!!answer && (
          <TouchableOpacity onPress={() => copyToClipboard(answer, 'Answer')}>
            <Text style={styles.copy}>📋 Copy</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.input}
        value={answer}
        multiline
        editable={false}
      />

      <View style={styles.row}>
        <Text style={styles.title}>
          ICE Candidates ({iceCandidates.length})
        </Text>
        {!!iceCandidates.length && (
          <TouchableOpacity
            onPress={() =>
              copyToClipboard(iceCandidates.join('\n'), 'ICE candidates')
            }
          >
            <Text style={styles.copy}>📋 Copy All</Text>
          </TouchableOpacity>
        )}
      </View>

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
    maxHeight: 150,
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
  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
copy: {
  fontSize: 14,
  color: '#1565c0',
},

});
