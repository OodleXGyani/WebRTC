import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@webrtc_app/userId';

/**
 * Generate a unique user ID combining username and random identifier
 * Format: "username_randomhex"
 */
const generateUniqueId = (): string => {
  const defaultUsername = 'user';
  const randomHex = Math.random().toString(16).substring(2, 8);
  return `${defaultUsername}_${randomHex}`;
};

/**
 * Get or create the user's unique ID
 * On first run, generates and saves ID to AsyncStorage
 * On subsequent runs, retrieves the saved ID
 */
export const getUserId = async (): Promise<string> => {
  try {
    // Try to get existing ID from storage
    const storedId = await AsyncStorage.getItem(USER_ID_KEY);

    if (storedId) {
      console.log('[UserId] Retrieved existing user ID:', storedId);
      return storedId;
    }

    // Generate new ID if none exists
    const newId = generateUniqueId();
    await AsyncStorage.setItem(USER_ID_KEY, newId);
    console.log('[UserId] Generated and saved new user ID:', newId);

    return newId;
  } catch (error) {
    console.error('[UserId] Failed to get or create user ID:', error);
    // Fallback to generating a temporary ID if AsyncStorage fails
    return generateUniqueId();
  }
};

/**
 * Reset the user ID (useful for testing or logout)
 */
export const resetUserId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    console.log('[UserId] User ID reset');
  } catch (error) {
    console.error('[UserId] Failed to reset user ID:', error);
  }
};

/**
 * Get the current user ID synchronously from cache
 * NOTE: Only use this after getUserId() has been called
 */
let cachedUserId: string | null = null;

export const setCachedUserId = (id: string): void => {
  cachedUserId = id;
};

export const getCachedUserId = (): string | null => {
  return cachedUserId;
};
