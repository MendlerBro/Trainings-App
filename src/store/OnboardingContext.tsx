import React, { createContext, useContext, useMemo, useState } from 'react';

import { Equipment, ExperienceLevel, SessionDuration, Sex, TrainingGoal } from '../types';

export interface OnboardingDraft {
  name: string;
  sex: Sex;
  age: number | null;
  goal: TrainingGoal | null;
  experience: ExperienceLevel | null;
  daysPerWeek: number | null;
  equipment: Equipment | null;
  sessionDuration: SessionDuration | null;
}

const initialDraft: OnboardingDraft = {
  name: '',
  sex: 'unspecified',
  age: null,
  goal: null,
  experience: null,
  daysPerWeek: null,
  equipment: null,
  sessionDuration: null,
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  update: (updates: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      update: (updates) => setDraft((prev) => ({ ...prev, ...updates })),
      reset: () => setDraft(initialDraft),
    }),
    [draft]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
