import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
// Imported from `@firebase/auth` directly (not the `firebase/auth` re-export):
// only `@firebase/auth`'s package.json declares a legacy `"react-native"` main
// field, which is what makes Metro resolve the React Native build that actually
// contains `getReactNativePersistence`. Importing from `firebase/auth` silently
// resolves to the web build instead, which is missing that export.
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from '@firebase/auth';

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
    '[firebase] Keine Firebase-Konfiguration gefunden — die App läuft im lokalen Gast-Modus ' +
      'ohne Login/Cloud-Sync. Zum Aktivieren .env anhand von .env.example ausfüllen ' +
      '(siehe README.md, Abschnitt "Firebase & Login einrichten").'
  );
}

// Every consumer (AuthContext, cloudSync) already checks `isFirebaseConfigured`
// before touching these, so it's safe — and important — to skip initializing the
// SDK at all while unconfigured: with an empty config, initializeAuth's RN
// persistence layer fails non-obviously ("Component auth has not been registered
// yet") instead of a clean, catchable error.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // initializeAuth() throws if called twice for the same app (e.g. Fast Refresh
  // during development) — fall back to the already-initialized instance.
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app);
  }

  firestore = getFirestore(app);
}

// Non-null once `isFirebaseConfigured` is true — callers must check that first.
export { app, auth, firestore };
