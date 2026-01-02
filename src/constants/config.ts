/**
 * Centralized configuration for the WebRTC application
 * All hardcoded values should be placed here for easy management
 */


export const SIGNALING_SERVER_URL = 'ws://192.168.18.186:8080';

/**
 * App name and version
 */

export const APP_NAME = 'WebRTC Calling';
export const APP_VERSION = '1.0.0';

/**
 * Logging configuration
 */
export const LOGGING = {
  enableDebugLogs: true,
  logNetworkEvents: true,
  logSignalingMessages: true,
};

/**
 * WebRTC configuration
 */
export const WEBRTC_CONFIG = {
  offerOptions: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  },
};
