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

export interface WebRTCHookReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  iceCandidates: string[];
  createOffer: () => Promise<string | null>;
  createAnswer: (offerSDP: string) => Promise<string | null>;
  applyAnswer: (answerSDP: string) => Promise<void>;
  addIceCandidate: (candidateText: string) => Promise<void>;
  toggleMic: () => void;
  toggleCamera: () => void;
  endCall: () => void;
  isMicOn: boolean;
  isCamOn: boolean;
  initError: string | null;
}

export const useWebRTC = (): WebRTCHookReturn => {
  const pcRef = useRef<PCWithEvents | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [iceCandidates, setIceCandidates] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const localMediaStream = await getLocalStream();
        if (!mounted) return;

        if (!localMediaStream) {
          const errorMsg = 'Unable to access camera/microphone. Check permissions and ensure you are testing on a physical device (emulators may not have camera support).';
          console.warn('[WebRTC]', errorMsg);
          setInitError(errorMsg);
          return;
        }

        setLocalStream(localMediaStream);
        setInitError(null);

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

        const stream: MediaStream = localMediaStream;
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pcRef.current = pc;
      } catch (error) {
        if (mounted) {
          const errorMsg = `Failed to initialize WebRTC: ${error instanceof Error ? error.message : String(error)}`;
          console.error('[WebRTC] Initialization error:', error);
          setInitError(errorMsg);
        }
      }
    })();

    return () => {
      mounted = false;
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  const toggleMic = () => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMicOn;
    });

    setIsMicOn(prev => !prev);
  };

  const toggleCamera = () => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach(track => {
      track.enabled = !isCamOn;
    });

    setIsCamOn(prev => !prev);
  };

  const endCall = () => {
    // localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());

    pcRef.current?.close();
    pcRef.current = null;

    // setLocalStream(null);
    setRemoteStream(null);
    setIsMicOn(true);
    setIsCamOn(true);
  };

  const createOffer = async (): Promise<string | null> => {
    try {
      const pc = pcRef.current;
      if (!pc) {
        console.warn('[WebRTC] PeerConnection not initialized');
        return null;
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);
      return JSON.stringify(offer);
    } catch (error) {
      console.error('[WebRTC] Failed to create offer:', error);
      return null;
    }
  };

  const createAnswer = async (offerSDP: string): Promise<string | null> => {
    try {
      const pc = pcRef.current;
      if (!pc) {
        console.warn('[WebRTC] PeerConnection not initialized');
        return null;
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(offerSDP))
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      return JSON.stringify(answer);
    } catch (error) {
      console.error('[WebRTC] Failed to create answer:', error);
      return null;
    }
  };

  const applyAnswer = async (answerSDP: string) => {
    try {
      const pc = pcRef.current;
      if (!pc) {
        console.warn('[WebRTC] PeerConnection not initialized');
        return;
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(answerSDP))
      );
    } catch (error) {
      console.error('[WebRTC] Failed to apply answer:', error);
    }
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
      } catch {
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
    toggleMic,
    toggleCamera,
    endCall,
    isMicOn,
    isCamOn,
    initError,
  };
};
