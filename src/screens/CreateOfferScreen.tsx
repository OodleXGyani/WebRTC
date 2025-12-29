import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


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
  const navigation = useNavigation<any>();


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
  Alert.alert('Copied', `${label} copied to clipboard`);
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

      <View style={styles.row}>
        <Text style={styles.title}>Offer (copy & send)</Text>
        {!!offer && (
          <TouchableOpacity onPress={() => copyToClipboard(offer, 'Offer')}>
            <Text style={styles.copy}>📋 Copy</Text>
          </TouchableOpacity>
        )}
      </View>

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
      <View style={{ height: 20 }} />
      <Button
        title="Go to Join Call"
        onPress={() => navigation.navigate('Join')}
      />

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
