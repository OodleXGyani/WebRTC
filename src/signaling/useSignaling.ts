import { useEffect, useRef, useState, useCallback } from 'react';
import { getUserId, setCachedUserId } from '../utils/userId';
import { SignalingSocket, initSignalingSocket, getSignalingSocket, SocketState } from './socket';
import {
  SignalMessage,
  CallMessage,
  OfferMessage,
  AnswerMessage,
  IceMessage,
  EndMessage,
} from './types';

export interface UseSignalingOptions {
  serverUrl: string;
  onWebRTCEvent?: (event: WebRTCEvent) => void;
}

export interface WebRTCEvent {
  type: 'incoming_call' | 'offer' | 'answer' | 'ice' | 'end_call';
  from?: string;
  data?: unknown;
}

export interface UseSignalingReturn {
  userId: string | null;
  isConnected: boolean;
  incomingCallFrom: string | null;
  activeRemoteUserId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  callUser: (targetUserId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  sendOffer: (offerSDP: string, targetUserId: string) => void;
  sendAnswer: (answerSDP: string, targetUserId: string) => void;
  sendIceCandidate: (candidate: string, targetUserId: string) => void;
  endCall: (targetUserId: string) => void;
  error: string | null;
}

export const useSignaling = (options: UseSignalingOptions): UseSignalingReturn => {
  const { serverUrl, onWebRTCEvent } = options;

  const socketRef = useRef<SignalingSocket | null>(null);
  const userIdRef = useRef<string | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const connectingRef = useRef(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null);
  const [activeRemoteUserId, setActiveRemoteUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize userId on component mount
   */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const id = await getUserId();
        if (mounted) {
          userIdRef.current = id;
          setCachedUserId(id);
          setUserId(id);
          console.log('[Signaling] Initialized with userId:', id);
        }
      } catch (err) {
        if (mounted) {
          const errorMsg = `Failed to get user ID: ${err instanceof Error ? err.message : String(err)}`;
          console.error('[Signaling]', errorMsg);
          setError(errorMsg);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Handle incoming signaling messages
   */
  const handleMessage = useCallback(
    (message: SignalMessage) => {
      const myUserId = userIdRef.current;
      if (!myUserId) {
        console.warn('[Signaling] Received message but userId not initialized');
        return;
      }

      const fromUser = 'from' in message ? message.from : 'unknown';
      console.log('[Signaling] Received message:', message.type, 'from:', fromUser);

      switch (message.type) {
        case 'call': {
          const callMsg = message as CallMessage;
          setIncomingCallFrom(callMsg.from);
          onWebRTCEvent?.({
            type: 'incoming_call',
            from: callMsg.from,
          });
          break;
        }

        case 'offer': {
          const offerMsg = message as OfferMessage;
          setActiveRemoteUserId(offerMsg.from);
          onWebRTCEvent?.({
            type: 'offer',
            from: offerMsg.from,
            data: offerMsg.sdp,
          });
          break;
        }

        case 'answer': {
          const answerMsg = message as AnswerMessage;
          onWebRTCEvent?.({
            type: 'answer',
            from: answerMsg.from,
            data: answerMsg.sdp,
          });
          break;
        }

        case 'ice': {
          const iceMsg = message as IceMessage;
          onWebRTCEvent?.({
            type: 'ice',
            from: iceMsg.from,
            data: iceMsg.candidate,
          });
          break;
        }

        case 'end': {
          const endMsg = message as EndMessage;
          setIncomingCallFrom(null);
          setActiveRemoteUserId(null);
          onWebRTCEvent?.({
            type: 'end_call',
            from: endMsg.from,
          });
          break;
        }

        default:
          console.warn('[Signaling] Unknown message type:', (message as any).type);
      }
    },
    [onWebRTCEvent]
  );

  /**
   * Handle socket state changes
   */
  const handleStateChange = useCallback((state: SocketState) => {
    const isNowConnected = state === SocketState.CONNECTED;
    setIsConnected(isNowConnected);

    if (isNowConnected) {
      setError(null);
    } else if (state === SocketState.ERROR) {
      setError('Socket connection error');
    }
  }, []);

  /**
   * Connect to signaling server
   */
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connect attempts
    if (connectingRef.current) {
      console.log('[Signaling] Connect already in progress, skipping...');
      return;
    }

    console.log('[Signaling] connect() called', {
      userIdInitialized: !!userIdRef.current,
      socketExists: !!socketRef.current,
      stack: new Error().stack,
    });

    connectingRef.current = true;

    try {
      let myUserId = userIdRef.current;

      // Wait for userId if not yet initialized (max 5 seconds)
      if (!myUserId) {
        console.log('[Signaling] Waiting for userId to initialize...');
        for (let i = 0; i < 50; i++) {
          await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
          myUserId = userIdRef.current;
          if (myUserId) break;
        }
      }

      if (!myUserId) {
        throw new Error('userId not initialized after timeout');
      }

      // Get or initialize socket
      let socket = getSignalingSocket();
      if (!socket) {
        socket = initSignalingSocket(serverUrl);
        socketRef.current = socket;
      }

      // Clean up existing handlers to prevent accumulation
      unsubscribersRef.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (err) {
          console.warn('[Signaling] Error cleaning up old handler:', err);
        }
      });
      unsubscribersRef.current = [];

      // Set up message handler
      const unsubscribeMessage = socket.onMessage(handleMessage);
      unsubscribersRef.current.push(unsubscribeMessage);

      // Set up state change handler
      const unsubscribeState = socket.onStateChange(handleStateChange);
      unsubscribersRef.current.push(unsubscribeState);

      // Connect if not already connected
      if (!socket.isConnected()) {
        await socket.connect();
      }

      // Give connection a moment to fully stabilize
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

      // Register with server
      socket.send({
        type: 'register',
        userId: myUserId,
      });

      console.log('[Signaling] Connected and registered with userId:', myUserId);
    } catch (err) {
      const errorMsg = `Failed to connect: ${err instanceof Error ? err.message : String(err)}`;
      console.error('[Signaling]', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      connectingRef.current = false;
    }
  }, [serverUrl, handleMessage, handleStateChange]);

  /**
   * Disconnect from signaling server
   */
  const disconnect = useCallback(() => {
    console.log('[Signaling] disconnect() called', {
      stack: new Error().stack,
    });

    const socket = socketRef.current || getSignalingSocket();
    if (socket) {
      socket.disconnect();
    }

    // Clean up handlers
    unsubscribersRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (err) {
        console.warn('[Signaling] Error cleaning up handler:', err);
      }
    });
    unsubscribersRef.current = [];

    // Reset state
    connectingRef.current = false;
    setIsConnected(false);
    setIncomingCallFrom(null);
    setActiveRemoteUserId(null);
    console.log('[Signaling] Disconnected');
  }, []);

  /**
   * Call a specific user
   */
  const callUser = useCallback(
    async (targetUserId: string) => {
      const socket = socketRef.current || getSignalingSocket();
      const myUserId = userIdRef.current;

      if (!socket || !myUserId) {
        throw new Error('Not connected or userId not available');
      }

      setActiveRemoteUserId(targetUserId);

      const message: CallMessage = {
        type: 'call',
        from: myUserId,
        to: targetUserId,
      };

      socket.send(message);
      console.log('[Signaling] Sent call to:', targetUserId);
    },
    []
  );

  /**
   * Accept incoming call
   */
  const acceptCall = useCallback(async () => {
    if (!incomingCallFrom) {
      throw new Error('No incoming call to accept');
    }

    setActiveRemoteUserId(incomingCallFrom);
    setIncomingCallFrom(null);
    console.log('[Signaling] Call accepted from:', incomingCallFrom);
  }, [incomingCallFrom]);

  /**
   * Reject incoming call
   */
  const rejectCall = useCallback(() => {
    if (!incomingCallFrom) return;

    const socket = socketRef.current || getSignalingSocket();
    const myUserId = userIdRef.current;

    if (socket && myUserId) {
      const message: EndMessage = {
        type: 'end',
        from: myUserId,
        to: incomingCallFrom,
      };
      socket.send(message);
    }

    setIncomingCallFrom(null);
    console.log('[Signaling] Call rejected from:', incomingCallFrom);
  }, [incomingCallFrom]);

  /**
   * Send SDP offer
   */
  const sendOffer = useCallback((offerSDP: string, targetUserId: string) => {
    const socket = socketRef.current || getSignalingSocket();
    const myUserId = userIdRef.current;

    if (!socket || !myUserId) {
      console.warn('[Signaling] Cannot send offer - not connected');
      return;
    }

    const message: OfferMessage = {
      type: 'offer',
      from: myUserId,
      to: targetUserId,
      sdp: offerSDP,
    };

    socket.send(message);
    console.log('[Signaling] Sent offer to:', targetUserId);
  }, []);

  /**
   * Send SDP answer
   */
  const sendAnswer = useCallback((answerSDP: string, targetUserId: string) => {
    const socket = socketRef.current || getSignalingSocket();
    const myUserId = userIdRef.current;

    if (!socket || !myUserId) {
      console.warn('[Signaling] Cannot send answer - not connected');
      return;
    }

    const message: AnswerMessage = {
      type: 'answer',
      from: myUserId,
      to: targetUserId,
      sdp: answerSDP,
    };

    socket.send(message);
    console.log('[Signaling] Sent answer to:', targetUserId);
  }, []);

  /**
   * Send ICE candidate
   */
  const sendIceCandidate = useCallback((candidate: string, targetUserId: string) => {
    const socket = socketRef.current || getSignalingSocket();
    const myUserId = userIdRef.current;

    if (!socket || !myUserId) {
      console.warn('[Signaling] Cannot send ICE - not connected');
      return;
    }

    const message: IceMessage = {
      type: 'ice',
      from: myUserId,
      to: targetUserId,
      candidate: candidate,
    };

    socket.send(message);
  }, []);

  /**
   * End call
   */
  const endCall = useCallback((targetUserId: string) => {
    const socket = socketRef.current || getSignalingSocket();
    const myUserId = userIdRef.current;

    if (!socket || !myUserId) {
      console.warn('[Signaling] Cannot end call - not connected');
      return;
    }

    const message: EndMessage = {
      type: 'end',
      from: myUserId,
      to: targetUserId,
    };

    socket.send(message);
    setActiveRemoteUserId(null);
    setIncomingCallFrom(null);
    console.log('[Signaling] Sent end call to:', targetUserId);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    userId,
    isConnected,
    incomingCallFrom,
    activeRemoteUserId,
    connect,
    disconnect,
    callUser,
    acceptCall,
    rejectCall,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    endCall,
    error,
  };
};
