import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Imported from `@firebase/auth` directly (not the `firebase/auth` re-export):
// only `@firebase/auth`'s package.json declares a legacy `"react-native"` main
// field, which is what makes Metro resolve the React Native build that actually
// contains `getReactNativePersistence`. Importing from `firebase/auth` silently
// resolves to the web build instead, which is missing that export.
import { getAuth, getReactNativePersistence, initializeAuth } from '@firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

if (!isFirebaseConfigured) {
  console.warn(
    '[firebase] Keine Firebase-Konfiguration gefunden. Bitte .env anhand von .env.example ausfüllen ' +
      '(siehe README.md, Abschnitt "Firebase & Login einrichten").'
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth() throws if called twice for the same app (e.g. Fast Refresh
// during development) — fall back to the already-initialized instance.
export const auth = (() => {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
})();

export const firestore = getFirestore(app);
export { app };
