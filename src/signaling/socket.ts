import { SignalMessage, isSignalMessage } from './types';

type MessageHandler = (message: SignalMessage) => void;
type StateChangeHandler = (state: SocketState) => void;

export enum SocketState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

/**
 * WebSocket transport layer - handles low-level WebSocket communication
 * Responsibilities:
 *   - Open/close connections
 *   - Send and receive JSON messages
 *   - Auto-reconnect on disconnect
 *   - NO business logic, just a "pipe"
 */
export class SignalingSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private state: SocketState = SocketState.DISCONNECTED;
  private messageHandlers: Set<MessageHandler> = new Set();
  private stateChangeHandlers: Set<StateChangeHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;

  constructor(serverUrl: string) {
    this.url = serverUrl;
  }

  /**
   * Connect to the signaling server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[Socket] connect() called', {
          currentState: this.state,
          wsExists: !!this.ws,
          stack: new Error().stack,
        });
        this.intentionallyClosed = false;
        this.setState(SocketState.CONNECTING);
        console.log('[Socket] Connecting to:', this.url);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[Socket] Connected');
          this.setState(SocketState.CONNECTED);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: WebSocketMessageEvent) => {
          try {
            const data = JSON.parse(event.data);

            if (!isSignalMessage(data)) {
              console.warn('[Socket] Invalid message format:', data);
              return;
            }

            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('[Socket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error: Event) => {
          const errorMsg = `WebSocket error: ${error.toString()}`;
          console.error('[Socket]', errorMsg);
          this.setState(SocketState.ERROR);
          reject(new Error(errorMsg));
        };

        this.ws.onclose = () => {
          console.log('[Socket] Disconnected', {
            intentionallyClosed: this.intentionallyClosed,
            code: (this.ws as any)?.code,
            reason: (this.ws as any)?.reason,
          });
          this.setState(SocketState.DISCONNECTED);

          // Only auto-reconnect if not intentionally closed
          if (!this.intentionallyClosed) {
            this.attemptReconnect();
          } else {
            this.intentionallyClosed = false;
          }
        };
      } catch (error) {
        const errorMsg = `Failed to create WebSocket: ${error instanceof Error ? error.message : String(error)}`;
        console.error('[Socket]', errorMsg);
        this.setState(SocketState.ERROR);
        reject(new Error(errorMsg));
      }
    });
  }

  /**
   * Send a message to the server with retry logic
   */
  public send(message: SignalMessage, retryCount = 0): void {
    if (!this.ws) {
      console.warn('[Socket] Cannot send - WebSocket not initialized');
      return;
    }

    // If not connected, silently return
    if (this.state !== SocketState.CONNECTED) {
      console.warn('[Socket] Cannot send - not in CONNECTED state:', this.state);
      return;
    }

    try {
      // Check actual WebSocket readyState
      if (this.ws.readyState !== WebSocket.OPEN) {
        // Retry once after a short delay if still connecting
        if (retryCount < 1 && this.ws.readyState === WebSocket.CONNECTING) {
          console.warn('[Socket] WebSocket still connecting, retrying in 100ms...');
          setTimeout(() => this.send(message, retryCount + 1), 100);
          return;
        }
        console.warn('[Socket] WebSocket not in OPEN state:', this.ws.readyState);
        return;
      }

      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[Socket] Failed to send message:', error);
    }
  }

  /**
   * Register a handler for incoming messages
   */
  public onMessage(handler: (message: SignalMessage) => void): () => void {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Register a handler for state changes
   */
  public onStateChange(handler: (state: SocketState) => void): () => void {
    this.stateChangeHandlers.add(handler);

    return () => {
      this.stateChangeHandlers.delete(handler);
    };
  }

  /**
   * Disconnect and clean up
   */
  public disconnect(): void {
    console.log('[Socket] disconnect() called explicitly', {
      intentionallyClosed: this.intentionallyClosed,
      wsState: this.ws?.readyState,
      currentState: this.state,
      stack: new Error().stack, // Capture call stack
    });

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.intentionallyClosed = true;
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setState(SocketState.DISCONNECTED);
    console.log('[Socket] Disconnected');
  }

  /**
   * Get current connection state
   */
  public getState(): SocketState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === SocketState.CONNECTED;
  }

  // Private methods

  private setState(newState: SocketState): void {
    if (this.state === newState) return;

    this.state = newState;
    console.log('[Socket] State changed to:', newState);
    this.stateChangeHandlers.forEach(handler => handler(newState));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Socket] Max reconnect attempts reached');
      this.setState(SocketState.ERROR);
      return;
    }

    this.reconnectAttempts += 1;
    // Exponential backoff with max delay of 30 seconds
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(
      `[Socket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[Socket] Reconnection failed:', error);
      });
    }, delay);
  }
}

/**
 * Singleton instance
 */
let signalingSocket: SignalingSocket | null = null;

export const initSignalingSocket = (serverUrl: string): SignalingSocket => {
  if (signalingSocket) {
    console.warn('[Socket] Socket already initialized, returning existing instance');
    return signalingSocket;
  }

  signalingSocket = new SignalingSocket(serverUrl);
  return signalingSocket;
};

export const getSignalingSocket = (): SignalingSocket | null => {
  return signalingSocket;
};
