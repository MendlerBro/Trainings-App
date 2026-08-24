import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { CloudData, pushCloudData, subscribeToCloudData } from '../lib/cloudSync';
import { generatePlan } from '../lib/planGenerator';
import { clearUserData, getItem, setItem } from '../lib/storage';
import { TrainingPlan, UserProfile, WorkoutLogEntry } from '../types';
import { useAuth } from './AuthContext';

interface AppContextValue {
  isLoading: boolean;
  profile: UserProfile | null;
  plan: TrainingPlan | null;
  logs: WorkoutLogEntry[];
  onboardingComplete: boolean;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  regeneratePlan: () => Promise<void>;
  logWorkout: (entry: WorkoutLogEntry) => Promise<void>;
  resetTrainingData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [logs, setLogs] = useState<WorkoutLogEntry[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Guards against a cloud snapshot for a previous user landing after switching accounts.
  const activeUid = useRef<string | null>(null);

  useEffect(() => {
    activeUid.current = uid;

    if (!uid) {
      setProfile(null);
      setPlan(null);
      setLogs([]);
      setOnboardingComplete(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;

    (async () => {
      // 1) Local cache first — instant, works offline.
      const [cachedProfile, cachedPlan, cachedLogs, cachedOnboarding] = await Promise.all([
        getItem<UserProfile>(uid, 'profile'),
        getItem<TrainingPlan>(uid, 'plan'),
        getItem<WorkoutLogEntry[]>(uid, 'logs'),
        getItem<boolean>(uid, 'onboardingComplete'),
      ]);
      if (cancelled || activeUid.current !== uid) return;
      setProfile(cachedProfile);
      setPlan(cachedPlan);
      setLogs(cachedLogs ?? []);
      setOnboardingComplete(Boolean(cachedOnboarding));
      setIsLoading(false);
    })();

    // 2) Cloud subscription — reconciles with other devices / fills in on a fresh install.
    const unsubscribe = subscribeToCloudData(uid, (cloud: CloudData | null) => {
      if (activeUid.current !== uid || !cloud) return;
      if (cloud.profile) {
        setProfile(cloud.profile);
        setItem(uid, 'profile', cloud.profile);
      }
      if (cloud.plan) {
        setPlan(cloud.plan);
        setItem(uid, 'plan', cloud.plan);
      }
      setLogs(cloud.logs);
      setItem(uid, 'logs', cloud.logs);
      if (cloud.onboardingComplete) {
        setOnboardingComplete(true);
        setItem(uid, 'onboardingComplete', true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [uid]);

  const completeOnboarding = useCallback(
    async (newProfile: UserProfile) => {
      if (!uid) return;
      const newPlan = generatePlan(newProfile);
      setProfile(newProfile);
      setPlan(newPlan);
      setOnboardingComplete(true);
      await Promise.all([
        setItem(uid, 'profile', newProfile),
        setItem(uid, 'plan', newPlan),
        setItem(uid, 'onboardingComplete', true),
      ]);
      pushCloudData(uid, { profile: newProfile, plan: newPlan, onboardingComplete: true });
    },
    [uid]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!uid) return;
      setProfile((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...updates };
        setItem(uid, 'profile', merged);
        pushCloudData(uid, { profile: merged });
        return merged;
      });
    },
    [uid]
  );

  const regeneratePlan = useCallback(async () => {
    if (!uid) return;
    setProfile((currentProfile) => {
      if (!currentProfile) return currentProfile;
      const newPlan = generatePlan(currentProfile);
      setPlan(newPlan);
      setItem(uid, 'plan', newPlan);
      pushCloudData(uid, { plan: newPlan });
      return currentProfile;
    });
  }, [uid]);

  const logWorkout = useCallback(
    async (entry: WorkoutLogEntry) => {
      if (!uid) return;
      setLogs((prev) => {
        const next = [...prev, entry];
        setItem(uid, 'logs', next);
        pushCloudData(uid, { logs: next });
        return next;
      });
    },
    [uid]
  );

  /** Clears profile/plan/history but keeps the account signed in — user redoes onboarding. */
  const resetTrainingData = useCallback(async () => {
    if (!uid) return;
    setProfile(null);
    setPlan(null);
    setLogs([]);
    setOnboardingComplete(false);
    await clearUserData(uid);
    pushCloudData(uid, { profile: null, plan: null, logs: [], onboardingComplete: false });
  }, [uid]);

  const value = useMemo<AppContextValue>(
    () => ({
      isLoading,
      profile,
      plan,
      logs,
      onboardingComplete,
      completeOnboarding,
      updateProfile,
      regeneratePlan,
      logWorkout,
      resetTrainingData,
    }),
    [isLoading, profile, plan, logs, onboardingComplete, completeOnboarding, updateProfile, regeneratePlan, logWorkout, resetTrainingData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
