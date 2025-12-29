import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from 'react-native-webrtc';

import { ICE_SERVERS } from '../constants/ice';

/**
 * Narrowed PeerConnection type that includes
 * runtime-supported callbacks missing from typings
 */
type PeerConnectionWithEvents = RTCPeerConnection & {
  onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null;
  ontrack: ((event: { streams: MediaStream[] }) => void) | null;
};

type IceCandidateCallback = (candidate: RTCIceCandidate) => void;
type RemoteStreamCallback = (stream: MediaStream) => void;

export const createPeerConnection = (
  onIceCandidate: IceCandidateCallback,
  onRemoteStream: RemoteStreamCallback
): RTCPeerConnection => {
  const peerConnection =
    new RTCPeerConnection(ICE_SERVERS) as PeerConnectionWithEvents;

  /* =========================
     ICE CANDIDATES
     ========================= */
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  /* =========================
     REMOTE TRACKS
     ========================= */
  peerConnection.ontrack = event => {
    const [remoteStream] = event.streams;
    if (remoteStream) {
      onRemoteStream(remoteStream);
    }
  };

  return peerConnection;
};

/* =========================
   SDP HELPERS
   ========================= */
export const setRemoteDescription = async (
  peerConnection: RTCPeerConnection,
  sdp: string
): Promise<void> => {
  const description = JSON.parse(sdp);
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(description)
  );
};

export const addIceCandidate = async (
  peerConnection: RTCPeerConnection,
  candidate: string
): Promise<void> => {
  const ice = JSON.parse(candidate);
  await peerConnection.addIceCandidate(
    new RTCIceCandidate(ice)
  );
};
