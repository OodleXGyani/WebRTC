import Clipboard from '@react-native-clipboard/clipboard';
import { Alert } from 'react-native';

export const copyToClipboard = async (text: string, label: string = 'Content') => {
  try {
    await Clipboard.setString(text);
    Alert.alert('Success', `${label} copied to clipboard`);
    return true;
  } catch (error) {
    Alert.alert('Error', 'Failed to copy to clipboard');
    return false;
  }
};

export const truncateText = (text: string, maxLength: number = 50, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};
