import { doc, DocumentData, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore, isFirebaseConfigured } from './firebase';
import { TrainingPlan, UserProfile, WorkoutLogEntry } from '../types';

export interface CloudData {
  profile: UserProfile | null;
  plan: TrainingPlan | null;
  logs: WorkoutLogEntry[];
  onboardingComplete: boolean;
}

function userDocRef(uid: string) {
  return doc(firestore, 'users', uid);
}

function toCloudData(data: DocumentData | undefined): CloudData | null {
  if (!data) return null;
  return {
    profile: data.profile ?? null,
    plan: data.plan ?? null,
    logs: data.logs ?? [],
    onboardingComplete: Boolean(data.onboardingComplete),
  };
}

/**
 * Subscribes to a user's cloud document in real time — changes made on another
 * device (or by a previous write from this one) come back through `onChange`.
 * Returns a no-op unsubscribe if Firebase isn't configured (offline-only mode).
 */
export function subscribeToCloudData(uid: string, onChange: (data: CloudData | null) => void): () => void {
  if (!isFirebaseConfigured) return () => {};
  return onSnapshot(
    userDocRef(uid),
    (snapshot) => onChange(toCloudData(snapshot.data())),
    (error) => console.warn('[cloudSync] Snapshot listener failed', error)
  );
}

/**
 * Merges a partial update into the user's cloud document. Fire-and-forget by
 * design — the local AsyncStorage cache is always the source of truth for the
 * UI, so a failed/offline write here must never block the app.
 */
export async function pushCloudData(uid: string, updates: Partial<CloudData>): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(userDocRef(uid), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.warn('[cloudSync] Failed to sync to cloud (will retry on next change)', error);
  }
}
