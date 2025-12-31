import { useEffect, useCallback, useRef } from 'react';
import { useWebRTC, WebRTCHookReturn } from './useWebRTC';
import { useSignaling, WebRTCEvent } from '../signaling/useSignaling';

export interface UseCallIntegrationOptions {
  serverUrl: string;
  autoConnect?: boolean;
}

export interface UseCallIntegrationReturn extends WebRTCHookReturn {
  // Signaling state
  userId: string | null;
  isSignalingConnected: boolean;
  incomingCallFrom: string | null;
  activeCallWith: string | null;

  // Signaling actions
  connect: () => Promise<void>;
  disconnect: () => void;
  callUser: (userId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCurrentCall: () => void;

  // Errors
  signalingError: string | null;
}

/**
 * useCallIntegration - Complete call orchestration
 *
 * Coordinates signaling (messaging) with WebRTC (media) so that:
 * 1. Signaling events trigger WebRTC methods
 * 2. WebRTC ICE candidates are sent via signaling
 * 3. Both systems stay in sync
 */
export const useCallIntegration = (
  options: UseCallIntegrationOptions
): UseCallIntegrationReturn => {
  const { serverUrl, autoConnect = false } = options;

  // Initialize WebRTC
  const webrtc = useWebRTC();

  // Keep refs to latest values to avoid dependency chains
  const webrtcRef = useRef(webrtc);
  const remoteUserIdRef = useRef<string | null>(null);
  const iceSendQueueRef = useRef<string[]>([]);
  const lastIceCountRef = useRef(0);

  // Update refs when values change
  useEffect(() => {
    webrtcRef.current = webrtc;
  }, [webrtc]);

  /**
   * Handle incoming signaling events and trigger WebRTC operations
   * This callback is stable and doesn't depend on webrtc, preventing re-renders
   */
  const handleWebRTCEvent = useCallback((event: WebRTCEvent): void => {
    console.log('[Integration] WebRTC event:', event.type, 'from:', event.from);

    switch (event.type) {
      case 'incoming_call':
        remoteUserIdRef.current = event.from || null;
        break;

      case 'offer': {
        const offerSDP = event.data as string;
        if (!offerSDP) break;
        remoteUserIdRef.current = event.from || null;

        (async () => {
          try {
            const answerSDP = await webrtcRef.current.createAnswer(offerSDP);
            if (answerSDP && event.from && signalingRef.current) {
              signalingRef.current.sendAnswer(answerSDP, event.from);
            }
          } catch (err) {
            console.error('[Integration] Failed to create answer:', err);
          }
        })();
        break;
      }

      case 'answer': {
        const answerSDP = event.data as string;
        if (!answerSDP) break;

        (async () => {
          try {
            await webrtcRef.current.applyAnswer(answerSDP);
          } catch (err) {
            console.error('[Integration] Failed to apply answer:', err);
          }
        })();
        break;
      }

      case 'ice': {
        const candidateText = event.data as string;
        if (!candidateText) break;

        (async () => {
          try {
            await webrtcRef.current.addIceCandidate(candidateText);
          } catch (err) {
            console.error('[Integration] Failed to add ICE candidate:', err);
          }
        })();
        break;
      }

      case 'end_call': {
        remoteUserIdRef.current = null;
        webrtcRef.current.endCall();
        break;
      }

      default:
        console.warn('[Integration] Unknown event:', event.type);
    }
  }, []); // Empty deps - callback is stable

  // Initialize signaling with stable callback
  const signaling = useSignaling({
    serverUrl,
    onWebRTCEvent: handleWebRTCEvent,
  });

  // Keep signaling ref for use in handleWebRTCEvent
  const signalingRef = useRef(signaling);
  useEffect(() => {
    signalingRef.current = signaling;
  }, [signaling]);

  /**
   * Watch for new ICE candidates from WebRTC and send them via signaling
   */
  useEffect(() => {
    const remoteUserId = remoteUserIdRef.current;

    // Check if we have new ICE candidates to send
    if (webrtc.iceCandidates.length > lastIceCountRef.current) {
      const newCount = webrtc.iceCandidates.length;

      for (let i = lastIceCountRef.current; i < newCount; i++) {
        const candidate = webrtc.iceCandidates[i];

        if (remoteUserId && signaling.isConnected) {
          signaling.sendIceCandidate(candidate, remoteUserId);
        } else {
          iceSendQueueRef.current.push(candidate);
        }
      }

      lastIceCountRef.current = newCount;
    }

    // Send any queued ICE candidates
    if (remoteUserId && signaling.isConnected && iceSendQueueRef.current.length > 0) {
      const queued = iceSendQueueRef.current;
      iceSendQueueRef.current = [];
      queued.forEach(candidate => {
        signaling.sendIceCandidate(candidate, remoteUserId);
      });
    }
  }, [webrtc.iceCandidates, signaling.isConnected, signaling]);

  /**
   * Call a remote user (caller side)
   */
  const callUser = useCallback(
    async (targetUserId: string) => {
      try {
        remoteUserIdRef.current = targetUserId;
        lastIceCountRef.current = 0;
        iceSendQueueRef.current = [];

        await signalingRef.current.callUser(targetUserId);

        const offerSDP = await webrtcRef.current.createOffer();
        if (offerSDP) {
          signalingRef.current.sendOffer(offerSDP, targetUserId);
        }
      } catch (error) {
        console.error('[Integration] Failed to call user:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Accept incoming call (receiver side)
   */
  const acceptCall = useCallback(async () => {
    try {
      const caller = signalingRef.current.incomingCallFrom;
      if (!caller) throw new Error('No incoming call');

      remoteUserIdRef.current = caller;
      lastIceCountRef.current = 0;
      iceSendQueueRef.current = [];

      await signalingRef.current.acceptCall();
    } catch (error) {
      console.error('[Integration] Failed to accept call:', error);
      throw error;
    }
  }, []);

  /**
   * Reject incoming call
   */
  const rejectCall = useCallback(() => {
    remoteUserIdRef.current = null;
    signalingRef.current.rejectCall();
  }, []);

  /**
   * End current active call
   */
  const endCurrentCall = useCallback(() => {
    const remoteUserId = remoteUserIdRef.current;

    if (remoteUserId) {
      signalingRef.current.endCall(remoteUserId);
    }

    remoteUserIdRef.current = null;
    lastIceCountRef.current = 0;
    iceSendQueueRef.current = [];
    webrtcRef.current.endCall();
  }, []);

  /**
   * Connect to signaling server
   */
  const connect = useCallback(async () => {
    await signalingRef.current.connect();
  }, []);

  /**
   * Disconnect from signaling server
   */
  const disconnect = useCallback(() => {
    remoteUserIdRef.current = null;
    webrtcRef.current.endCall();
    signalingRef.current.disconnect();
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect().catch(error => {
        console.error('[Integration] Auto-connect failed:', error);
      });
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    // WebRTC
    localStream: webrtc.localStream,
    remoteStream: webrtc.remoteStream,
    iceCandidates: webrtc.iceCandidates,
    isMicOn: webrtc.isMicOn,
    isCamOn: webrtc.isCamOn,
    initError: webrtc.initError,
    toggleMic: webrtc.toggleMic,
    toggleCamera: webrtc.toggleCamera,
    createOffer: webrtc.createOffer,
    createAnswer: webrtc.createAnswer,
    applyAnswer: webrtc.applyAnswer,
    addIceCandidate: webrtc.addIceCandidate,
    endCall: endCurrentCall,

    // Signaling
    userId: signaling.userId,
    isSignalingConnected: signaling.isConnected,
    incomingCallFrom: signaling.incomingCallFrom,
    activeCallWith: signaling.activeRemoteUserId,

    // Actions
    connect,
    disconnect,
    callUser,
    acceptCall,
    rejectCall,
    endCurrentCall,

    // Errors
    signalingError: signaling.error,
  };
};
