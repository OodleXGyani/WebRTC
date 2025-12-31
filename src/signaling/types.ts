/**
 * Signaling message types for WebRTC call coordination
 * All messages must conform to this interface structure
 */

export interface RegisterMessage {
  type: 'register';
  userId: string;
}

export interface CallMessage {
  type: 'call';
  from: string;
  to: string;
}

export interface OfferMessage {
  type: 'offer';
  from: string;
  to: string;
  sdp: string;
}

export interface AnswerMessage {
  type: 'answer';
  from: string;
  to: string;
  sdp: string;
}

export interface IceMessage {
  type: 'ice';
  from: string;
  to: string;
  candidate: string;
}

export interface EndMessage {
  type: 'end';
  from: string;
  to: string;
}

export type SignalMessage =
  | RegisterMessage
  | CallMessage
  | OfferMessage
  | AnswerMessage
  | IceMessage
  | EndMessage;

/**
 * Type guard to safely check message types
 */
export const isSignalMessage = (data: unknown): data is SignalMessage => {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as Record<string, unknown>;
  return typeof msg.type === 'string' && msg.type in typeGuards;
};

const typeGuards = {
  register: true,
  call: true,
  offer: true,
  answer: true,
  ice: true,
  end: true,
};
