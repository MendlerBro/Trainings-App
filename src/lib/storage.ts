import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin typed wrapper around AsyncStorage. Centralizing key names and JSON
 * (de)serialization here keeps persistence logic in one place and makes
 * failures (corrupted data, quota errors) fail soft instead of crashing the app.
 */
const KEYS = {
  profile: '@trainings_app/profile',
  plan: '@trainings_app/plan',
  logs: '@trainings_app/logs',
  onboardingComplete: '@trainings_app/onboarding_complete',
} as const;

export type StorageKey = keyof typeof KEYS;

export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS[key]);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to read "${key}"`, error);
    return null;
  }
}

export async function setItem<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Failed to write "${key}"`, error);
    return false;
  }
}

export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS[key]);
  } catch (error) {
    console.warn(`[storage] Failed to remove "${key}"`, error);
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.warn('[storage] Failed to clear storage', error);
  }
}
