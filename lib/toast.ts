import { Alert, ToastAndroid, Platform } from 'react-native';

export const toast = {
  success: (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Succès', msg);
    }
  },
  error: (msg: string) => {
    Alert.alert('Erreur', msg);
  },
  info: (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', msg);
    }
  }
};
