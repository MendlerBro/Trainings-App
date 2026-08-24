import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signInWithCredential, signOut, User } from '@firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { auth, isFirebaseConfigured } from '../lib/firebase';

/** Stable local-only "account" used while Firebase isn't configured yet, so the
 * app is fully usable (offline, no cloud sync) without any backend setup. Once
 * Firebase is configured, real sign-in takes over automatically. */
const GUEST_UID = 'local-guest';

if (isFirebaseConfigured) {
  try {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  } catch (error) {
    console.warn('[auth] GoogleSignin.configure failed (native module unavailable?)', error);
  }
}

interface AuthContextValue {
  user: User | null;
  /** True while Firebase isn't configured — app runs fully offline under a local guest identity. */
  isGuestMode: boolean;
  /** `user?.uid` when signed in, the guest id in guest mode, otherwise null (needs to sign in). */
  effectiveUid: string | null;
  isAuthLoading: boolean;
  isAppleSignInAvailable: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  /** The display name Apple provided on first sign-in only — prefills onboarding, if present. */
  suggestedName: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  // Apple only returns the user's name on the very first sign-in — nowhere else to grab it from later.
  const [suggestedName, setSuggestedName] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios' && isFirebaseConfigured) {
      AppleAuthentication.isAvailableAsync()
        .then(setIsAppleSignInAvailable)
        .catch(() => setIsAppleSignInAvailable(false));
    }
  }, []);

  const signInWithApple = async () => {
    if (!auth) return;
    setAuthError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple hat kein Identity-Token zurückgegeben.');
      }
      if (credential.fullName?.givenName) {
        setSuggestedName([credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' '));
      }
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({ idToken: credential.identityToken });
      await signInWithCredential(auth, firebaseCredential);
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') return; // user dismissed the sheet
      console.warn('[auth] Apple sign-in failed', error);
      setAuthError('Anmeldung mit Apple ist fehlgeschlagen. Bitte versuche es erneut.');
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) return;
    setAuthError(null);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response) || !response.data.idToken) {
        return; // user cancelled
      }
      if (response.data.user.name) {
        setSuggestedName(response.data.user.name);
      }
      const credential = GoogleAuthProvider.credential(response.data.idToken);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
      if (error?.code === 'SIGN_IN_CANCELLED' || error?.code === '-5') return;
      console.warn('[auth] Google sign-in failed', error);
      setAuthError('Anmeldung mit Google ist fehlgeschlagen. Bitte versuche es erneut.');
    }
  };

  const signOutUser = async () => {
    if (!auth) return;
    try {
      await GoogleSignin.signOut().catch(() => {});
      await signOut(auth);
    } catch (error) {
      console.warn('[auth] Sign-out failed', error);
    }
  };

  const isGuestMode = !isFirebaseConfigured;
  const effectiveUid = user?.uid ?? (isGuestMode ? GUEST_UID : null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGuestMode,
      effectiveUid,
      isAuthLoading,
      isAppleSignInAvailable,
      signInWithApple,
      signInWithGoogle,
      signOutUser,
      authError,
      suggestedName,
    }),
    [user, isGuestMode, effectiveUid, isAuthLoading, isAppleSignInAvailable, authError, suggestedName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
