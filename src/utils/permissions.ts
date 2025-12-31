import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request necessary media permissions on Android
 * iOS handles permissions via Info.plist usage descriptions
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  // iOS uses Info.plist configurations, no runtime request needed here
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const grants = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const cameraGranted =
      grants[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED;

    const audioGranted =
      grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
      PermissionsAndroid.RESULTS.GRANTED;

    const hasAllPermissions = cameraGranted && audioGranted;

    if (!hasAllPermissions) {
      console.warn(
        '[Permissions] Not all permissions granted. Camera:',
        cameraGranted,
        'Audio:',
        audioGranted
      );
    }

    return hasAllPermissions;
  } catch (error) {
    console.error('[Permissions] Failed to request permissions:', error);
    return false;
  }
};

/**
 * Check if we already have the necessary permissions
 */
export const checkMediaPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const cameraGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    const audioGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );

    return cameraGranted && audioGranted;
  } catch (error) {
    console.error('[Permissions] Failed to check permissions:', error);
    return false;
  }
};
