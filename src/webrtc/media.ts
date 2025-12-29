import {
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

export const getLocalStream = async (): Promise<MediaStream> => {
  const localMediaStream = await mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: 'user',
      width: 640,
      height: 480,
      frameRate: 30,
    },
  });

  return localMediaStream;
};
