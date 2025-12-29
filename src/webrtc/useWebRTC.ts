import { useEffect, useRef, useState } from 'react';
import {
  RTCPeerConnection,
  MediaStream,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

import { ICE_SERVERS } from '../constants/ice';
import { getLocalStream } from './media';

/* ====== Narrowed PC type ====== */
type PCWithEvents = RTCPeerConnection & {
  onicecandidate: ((e: { candidate: RTCIceCandidate | null }) => void) | null;
  ontrack: ((e: { streams: MediaStream[] }) => void) | null;
};

export const useWebRTC = () => {
  const pcRef = useRef<PCWithEvents | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [iceCandidates, setIceCandidates] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const localMediaStream = await getLocalStream();
      if (!mounted) return;

      setLocalStream(localMediaStream);

      const pc = new RTCPeerConnection(ICE_SERVERS) as PCWithEvents;

      pc.onicecandidate = event => {
        if (event.candidate) {
          setIceCandidates(prev => [
            ...prev,
            JSON.stringify(event.candidate),
          ]);
        }
      };

      pc.ontrack = event => {
        const [remote] = event.streams;
        if (remote) setRemoteStream(remote);
      };

      localMediaStream.getTracks().forEach(track => {
        pc.addTrack(track, localMediaStream);
      });

      pcRef.current = pc;
    })();

    return () => {
      mounted = false;
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  const createOffer = async (): Promise<string | null> => {
    const pc = pcRef.current;
    if (!pc) return null;

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await pc.setLocalDescription(offer);
    return JSON.stringify(offer);
  };

  const createAnswer = async (offerSDP: string): Promise<string | null> => {
    const pc = pcRef.current;
    if (!pc) return null;

    await pc.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(offerSDP))
    );

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    return JSON.stringify(answer);
  };

  const applyAnswer = async (answerSDP: string) => {
    const pc = pcRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(answerSDP))
    );
  };

  const addIceCandidate = async (candidateText: string) => {
  const pc = pcRef.current;
  if (!pc) return;

  const lines = candidateText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      await pc.addIceCandidate(new RTCIceCandidate(parsed));
    } catch (e) {
      console.warn('Skipped invalid ICE line:', line);
    }
  }
};


  return {
    localStream,
    remoteStream,
    iceCandidates,
    createOffer,
    createAnswer,
    applyAnswer,
    addIceCandidate,
  };
};
