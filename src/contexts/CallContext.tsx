import React, { createContext, useContext, useState, useCallback } from 'react';
import { MediaStream } from 'react-native-webrtc';
import { useCallIntegration } from '../webrtc/useCallIntegration';
import { SIGNALING_SERVER_URL } from '../constants/config';

/**
 * Complete call state and actions interface
 * Combines WebRTC, Signaling, and UI state into single source of truth
 */
export interface CallContextType {
  // ========== WebRTC State ==========
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  iceCandidates: string[];
  isMicOn: boolean;
  isCamOn: boolean;
  initError: string | null;

  // ========== Signaling State ==========
  userId: string | null;
  isSignalingConnected: boolean;
  incomingCallFrom: string | null;
  activeCallWith: string | null;
  signalingError: string | null;

  // ========== UI State ==========
  targetUserId: string;
  setTargetUserId: (userId: string) => void;

  // ========== WebRTC Actions ==========
  toggleMic: () => void;
  toggleCamera: () => void;
  createOffer: () => Promise<string | null>;
  createAnswer: (offerSDP: string) => Promise<string | null>;
  applyAnswer: (answerSDP: string) => Promise<void>;
  addIceCandidate: (candidateText: string) => Promise<void>;

  // ========== Signaling Actions ==========
  connect: () => Promise<void>;
  disconnect: () => void;
  callUser: (userId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
}

/**
 * Create context with default undefined

 */
const CallContext = createContext<CallContextType | undefined>(undefined);

/**
 * CallProvider component
 * Manages single instance of call orchestration
 * Provides all state and actions to descendant components via context
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  const [targetUserId, setTargetUserId] = useState<string>('');

  // Initialize hooks once at provider level
  const {
    // WebRTC state
    localStream,
    remoteStream,
    iceCandidates,
    isMicOn,
    isCamOn,
    initError,
    // WebRTC actions
    toggleMic,
    toggleCamera,
    createOffer,
    createAnswer,
    applyAnswer,
    addIceCandidate,
    // Signaling state
    userId,
    isSignalingConnected,
    incomingCallFrom,
    activeCallWith,
    signalingError,
    // Signaling actions
    connect,
    disconnect,
    callUser,
    acceptCall,
    rejectCall,
    endCurrentCall,
  } = useCallIntegration({
    serverUrl: SIGNALING_SERVER_URL,
    autoConnect: true,
  });

  /**
   * Unified end call action that handles both WebRTC and signaling cleanup
   */
  const endCall = useCallback(() => {
    endCurrentCall();
  }, [endCurrentCall]);

  const value: CallContextType = {
    // WebRTC state
    localStream,
    remoteStream,
    iceCandidates,
    isMicOn,
    isCamOn,
    initError,

    // Signaling state
    userId,
    isSignalingConnected,
    incomingCallFrom,
    activeCallWith,
    signalingError,

    // UI state
    targetUserId,
    setTargetUserId,

    // WebRTC actions
    toggleMic,
    toggleCamera,
    createOffer,
    createAnswer,
    applyAnswer,
    addIceCandidate,

    // Signaling actions
    connect,
    disconnect,
    callUser,
    acceptCall,
    rejectCall,
    endCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

/**
 * Custom hook to use call context
 * Throws error if used outside of CallProvider
 */
export function useCall(): CallContextType {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }

  return context;
}
