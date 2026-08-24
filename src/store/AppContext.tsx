import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { generatePlan } from '../lib/planGenerator';
import { clearAll, getItem, setItem } from '../lib/storage';
import { TrainingPlan, UserProfile, WorkoutLogEntry } from '../types';

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
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [logs, setLogs] = useState<WorkoutLogEntry[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedProfile, storedPlan, storedLogs, storedOnboarding] = await Promise.all([
          getItem<UserProfile>('profile'),
          getItem<TrainingPlan>('plan'),
          getItem<WorkoutLogEntry[]>('logs'),
          getItem<boolean>('onboardingComplete'),
        ]);
        setProfile(storedProfile);
        setPlan(storedPlan);
        setLogs(storedLogs ?? []);
        setOnboardingComplete(Boolean(storedOnboarding));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const completeOnboarding = useCallback(async (newProfile: UserProfile) => {
    const newPlan = generatePlan(newProfile);
    setProfile(newProfile);
    setPlan(newPlan);
    setOnboardingComplete(true);
    await Promise.all([
      setItem('profile', newProfile),
      setItem('plan', newPlan),
      setItem('onboardingComplete', true),
    ]);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...updates };
        setItem('profile', merged);
        return merged;
      });
    },
    []
  );

  const regeneratePlan = useCallback(async () => {
    setProfile((currentProfile) => {
      if (!currentProfile) return currentProfile;
      const newPlan = generatePlan(currentProfile);
      setPlan(newPlan);
      setItem('plan', newPlan);
      return currentProfile;
    });
  }, []);

  const logWorkout = useCallback(async (entry: WorkoutLogEntry) => {
    setLogs((prev) => {
      const next = [...prev, entry];
      setItem('logs', next);
      return next;
    });
  }, []);

  const resetApp = useCallback(async () => {
    await clearAll();
    setProfile(null);
    setPlan(null);
    setLogs([]);
    setOnboardingComplete(false);
  }, []);

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
      resetApp,
    }),
    [isLoading, profile, plan, logs, onboardingComplete, completeOnboarding, updateProfile, regeneratePlan, logWorkout, resetApp]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
