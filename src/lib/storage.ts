import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin typed wrapper around AsyncStorage, namespaced per signed-in user so that
 * switching accounts on the same device never mixes up cached data. This is the
 * offline-first local cache; `cloudSync.ts` mirrors the same data to Firestore
 * whenever the device is online and signed in.
 */
const KEY_NAMES = {
  profile: 'profile',
  plan: 'plan',
  logs: 'logs',
  onboardingComplete: 'onboarding_complete',
} as const;

export type StorageKey = keyof typeof KEY_NAMES;

function buildKey(uid: string, key: StorageKey): string {
  return `@trainings_app/${uid}/${KEY_NAMES[key]}`;
}

export async function getItem<T>(uid: string, key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(buildKey(uid, key));
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to read "${key}"`, error);
    return null;
  }
}

export async function setItem<T>(uid: string, key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(buildKey(uid, key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Failed to write "${key}"`, error);
    return false;
  }
}

export async function clearUserData(uid: string): Promise<void> {
  try {
    const keys = (Object.keys(KEY_NAMES) as StorageKey[]).map((k) => buildKey(uid, k));
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.warn('[storage] Failed to clear storage', error);
  }
}
