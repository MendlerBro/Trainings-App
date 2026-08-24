// Core domain types for the training planner.

export type TrainingGoal = 'muscle' | 'strength' | 'fatloss' | 'endurance' | 'general';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Equipment = 'bodyweight' | 'home_dumbbells' | 'full_gym';

export type SessionDuration = 30 | 45 | 60 | 90;

export type Sex = 'female' | 'male' | 'unspecified';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio'
  | 'fullBody';

/** Answers collected during onboarding — the single source of truth for plan generation. */
export interface UserProfile {
  name: string;
  sex: Sex;
  age: number | null;
  goal: TrainingGoal;
  experience: ExperienceLevel;
  daysPerWeek: number; // 2-6
  equipment: Equipment;
  sessionDuration: SessionDuration;
  createdAt: string; // ISO date
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  /** Minimum equipment tier required. bodyweight < home_dumbbells < full_gym. */
  requiresEquipment: Equipment;
  minLevel: ExperienceLevel; // minimum experience recommended
  description: string;
  cues: string[]; // short execution tips
  isCompound: boolean;
}

export interface PlannedSet {
  setNumber: number;
  targetReps: string; // e.g. "8-12" or "AMRAP"
  targetRpe?: string; // optional intensity hint
}

export interface PlannedExercise {
  exerciseId: string;
  sets: PlannedSet[];
  restSeconds: number;
}

export type DayFocus =
  | 'full_body'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'rest'
  | 'cardio';

export interface WorkoutDay {
  id: string; // stable id within the plan, e.g. "day-1"
  dayOfWeek: number; // 0 = Monday .. 6 = Sunday
  focus: DayFocus;
  title: string;
  exercises: PlannedExercise[];
  estimatedMinutes: number;
}

export interface TrainingPlan {
  id: string;
  createdAt: string; // ISO date
  goal: TrainingGoal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  days: WorkoutDay[]; // always 7 entries, dayOfWeek 0..6, rest days included
}

export interface CompletedSet {
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  done: boolean;
}

export interface WorkoutLogEntry {
  id: string;
  dateISO: string; // date the workout was logged (yyyy-mm-dd)
  dayId: string;
  planId: string;
  exercises: {
    exerciseId: string;
    sets: CompletedSet[];
  }[];
  durationMinutes: number | null;
  completedAt: string; // ISO timestamp
}

export interface AppState {
  profile: UserProfile | null;
  plan: TrainingPlan | null;
  logs: WorkoutLogEntry[];
  onboardingComplete: boolean;
}
