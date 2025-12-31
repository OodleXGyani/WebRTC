import {
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { requestMediaPermissions } from '../utils/permissions';

export const getLocalStream = async (
  useVideo: boolean = true
): Promise<MediaStream | null> => {
  try {
    // Request Android runtime permissions before getUserMedia
    const hasPermissions = await requestMediaPermissions();
    if (!hasPermissions) {
      console.warn('[WebRTC] Media permissions not granted by user');
      return null;
    }

    const localMediaStream = await mediaDevices.getUserMedia({
      audio: true,
      video: useVideo ? {
        facingMode: 'user',
        width: 640,
        height: 480,
        frameRate: 30,
      } : false,
    });

    return localMediaStream;
  } catch (error) {
    console.warn('[WebRTC] Failed to get local media stream:', error);

    // Fallback: try audio-only if video fails
    if (useVideo) {
      try {
        console.warn('[WebRTC] Attempting audio-only fallback...');
        return await getLocalStream(false);
      } catch (audioError) {
        console.warn('[WebRTC] Failed to get audio stream:', audioError);
        return null;
      }
    }

    return null;
  }
};
