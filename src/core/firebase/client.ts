import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';

/**
 * Config web do Firebase. Não é segredo: a config web é pública por desenho,
 * quem protege os dados são as security rules (Task 6).
 */
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(config);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// React Native não suporta os streams que o Firestore usa por padrão.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

if (process.env.EXPO_PUBLIC_USE_EMULATOR === '1') {
  // No Expo Go o app roda num aparelho físico: "localhost" seria o próprio celular.
  // `hostUri` traz o IP da máquina do Metro, que é onde os emuladores estão.
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}
