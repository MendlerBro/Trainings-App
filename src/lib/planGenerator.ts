import { EXERCISES } from '../data/exercises';
import {
  DayFocus,
  Equipment,
  Exercise,
  ExperienceLevel,
  MuscleGroup,
  PlannedExercise,
  PlannedSet,
  TrainingGoal,
  TrainingPlan,
  UserProfile,
  WorkoutDay,
} from '../types';

const EQUIPMENT_ORDER: Record<Equipment, number> = {
  bodyweight: 0,
  home_dumbbells: 1,
  full_gym: 2,
};

const EXPERIENCE_ORDER: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const FOCUS_LABELS: Record<DayFocus, string> = {
  full_body: 'Ganzkörper',
  upper: 'Oberkörper',
  lower: 'Unterkörper',
  push: 'Push (Brust, Schulter, Trizeps)',
  pull: 'Pull (Rücken, Bizeps)',
  legs: 'Beine',
  rest: 'Ruhetag',
  cardio: 'Cardio',
};

const FOCUS_MUSCLE_GROUPS: Record<Exclude<DayFocus, 'rest' | 'cardio'>, MuscleGroup[]> = {
  full_body: ['legs', 'chest', 'back', 'shoulders', 'core'],
  upper: ['chest', 'back', 'shoulders', 'arms'],
  lower: ['legs', 'core'],
  push: ['chest', 'shoulders', 'arms'],
  pull: ['back', 'arms'],
  legs: ['legs', 'core'],
};

/** Day-of-week templates (0=Mon..6=Sun) spreading training days evenly across the week. */
const SCHEDULE_TEMPLATES: Record<number, number[]> = {
  2: [0, 3], // Mon, Thu
  3: [0, 2, 4], // Mon, Wed, Fri
  4: [0, 1, 3, 4], // Mon, Tue, Thu, Fri
  5: [0, 1, 2, 4, 5], // Mon, Tue, Wed, Fri, Sat
  6: [0, 1, 2, 3, 4, 5], // Mon-Sat
};

/** Split templates (list of focuses in training-day order) by days/week. */
const SPLIT_TEMPLATES: Record<number, DayFocus[]> = {
  2: ['full_body', 'full_body'],
  3: ['full_body', 'full_body', 'full_body'],
  4: ['upper', 'lower', 'upper', 'lower'],
  5: ['push', 'pull', 'legs', 'upper', 'lower'],
  6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
};

const DAY_TITLES: Record<DayFocus, string[]> = {
  full_body: ['Ganzkörper A', 'Ganzkörper B', 'Ganzkörper C'],
  upper: ['Oberkörper A', 'Oberkörper B'],
  lower: ['Unterkörper A', 'Unterkörper B'],
  push: ['Push A', 'Push B'],
  pull: ['Pull A', 'Pull B'],
  legs: ['Beine A', 'Beine B'],
  rest: ['Ruhetag'],
  cardio: ['Cardio'],
};

interface SetScheme {
  sets: number;
  reps: string;
  restSeconds: number;
}

function getSetScheme(goal: TrainingGoal, experience: ExperienceLevel, isCompound: boolean): SetScheme {
  const base: Record<TrainingGoal, SetScheme> = {
    muscle: { sets: 4, reps: '8-12', restSeconds: 75 },
    strength: { sets: 5, reps: '3-6', restSeconds: 150 },
    fatloss: { sets: 3, reps: '12-15', restSeconds: 40 },
    endurance: { sets: 3, reps: '15-20', restSeconds: 30 },
    general: { sets: 3, reps: '10-12', restSeconds: 60 },
  };
  const scheme = { ...base[goal] };

  // Isolation work gets slightly fewer sets than compound lifts.
  if (!isCompound) scheme.sets = Math.max(2, scheme.sets - 1);

  // Beginners: fewer sets to build technique/recovery capacity gradually.
  if (experience === 'beginner') scheme.sets = Math.max(2, scheme.sets - 1);
  // Advanced trainees: a bit more compound volume.
  if (experience === 'advanced' && isCompound) scheme.sets += 1;

  return scheme;
}

function exerciseCountForDuration(duration: number, focus: DayFocus): number {
  const table: Record<number, number> = { 30: 4, 45: 5, 60: 6, 90: 8 };
  const base = table[duration] ?? 5;
  // Full body / push-pull-legs days cover more muscle groups, so give one extra slot.
  return focus === 'full_body' ? base + 1 : base;
}

function isExerciseAvailable(exercise: Exercise, profile: UserProfile): boolean {
  const equipmentOk = EQUIPMENT_ORDER[exercise.requiresEquipment] <= EQUIPMENT_ORDER[profile.equipment];
  const levelOk = EXPERIENCE_ORDER[exercise.minLevel] <= EXPERIENCE_ORDER[profile.experience] + 1;
  return equipmentOk && levelOk;
}

/**
 * Picks exercises for a focus day: gathers eligible candidates per targeted muscle
 * group, prioritizes compound movements, and rotates the selection using
 * `variationOffset` so repeated focuses across the week (e.g. two "Push" days)
 * don't end up identical.
 */
function pickExercisesForFocus(
  focus: Exclude<DayFocus, 'rest' | 'cardio'>,
  profile: UserProfile,
  count: number,
  variationOffset: number
): Exercise[] {
  const muscleGroups = FOCUS_MUSCLE_GROUPS[focus];
  const picked: Exercise[] = [];
  const usedIds = new Set<string>();

  const groupsCycle: MuscleGroup[] = [];
  // Cycle through the target muscle groups so exercises spread evenly across them.
  for (let i = 0; i < count; i++) {
    groupsCycle.push(muscleGroups[i % muscleGroups.length]);
  }

  for (const group of groupsCycle) {
    if (picked.length >= count) break;
    const candidates = EXERCISES.filter(
      (e) => e.muscleGroup === group && isExerciseAvailable(e, profile) && !usedIds.has(e.id)
    ).sort((a, b) => {
      // Compound first, then stable alphabetical-by-id ordering for determinism.
      if (a.isCompound !== b.isCompound) return a.isCompound ? -1 : 1;
      return a.id.localeCompare(b.id);
    });

    if (candidates.length === 0) continue;
    const index = variationOffset % candidates.length;
    const chosen = candidates[index];
    picked.push(chosen);
    usedIds.add(chosen.id);
  }

  // Fill any remaining slots (e.g. a muscle group ran out of unique candidates)
  // from the broader pool for this focus.
  if (picked.length < count) {
    const fallback = EXERCISES.filter(
      (e) => muscleGroups.includes(e.muscleGroup) && isExerciseAvailable(e, profile) && !usedIds.has(e.id)
    ).sort((a, b) => (a.isCompound !== b.isCompound ? (a.isCompound ? -1 : 1) : a.id.localeCompare(b.id)));
    for (const ex of fallback) {
      if (picked.length >= count) break;
      picked.push(ex);
      usedIds.add(ex.id);
    }
  }

  return picked;
}

function buildPlannedExercise(exercise: Exercise, profile: UserProfile): PlannedExercise {
  const scheme = getSetScheme(profile.goal, profile.experience, exercise.isCompound);
  const sets: PlannedSet[] = Array.from({ length: scheme.sets }, (_, i) => ({
    setNumber: i + 1,
    targetReps: scheme.reps,
  }));
  return { exerciseId: exercise.id, sets, restSeconds: scheme.restSeconds };
}

function estimateMinutes(exercises: PlannedExercise[]): number {
  const SECONDS_PER_SET_WORK = 40;
  const totalSeconds = exercises.reduce((sum, ex) => {
    return sum + ex.sets.length * (SECONDS_PER_SET_WORK + ex.restSeconds);
  }, 0);
  return Math.max(15, Math.round(totalSeconds / 60 / 5) * 5);
}

/** Generates a full 7-day training plan tailored to the given user profile. */
export function generatePlan(profile: UserProfile): TrainingPlan {
  const days = Math.min(6, Math.max(2, profile.daysPerWeek));
  const schedule = SCHEDULE_TEMPLATES[days] ?? SCHEDULE_TEMPLATES[3];
  const split = SPLIT_TEMPLATES[days] ?? SPLIT_TEMPLATES[3];

  const focusOccurrence: Partial<Record<DayFocus, number>> = {};
  const workoutDays: WorkoutDay[] = [];

  for (let dow = 0; dow < 7; dow++) {
    const scheduleIndex = schedule.indexOf(dow);
    if (scheduleIndex === -1) {
      workoutDays.push({
        id: `day-${dow}`,
        dayOfWeek: dow,
        focus: 'rest',
        title: 'Ruhetag',
        exercises: [],
        estimatedMinutes: 0,
      });
      continue;
    }

    const focus = split[scheduleIndex] as Exclude<DayFocus, 'rest' | 'cardio'>;
    const occurrence = focusOccurrence[focus] ?? 0;
    focusOccurrence[focus] = occurrence + 1;

    const count = exerciseCountForDuration(profile.sessionDuration, focus);
    const chosenExercises = pickExercisesForFocus(focus, profile, count, occurrence * 2);
    const plannedExercises = chosenExercises.map((ex) => buildPlannedExercise(ex, profile));
    const titles = DAY_TITLES[focus];
    const title = titles[occurrence % titles.length] ?? FOCUS_LABELS[focus];

    workoutDays.push({
      id: `day-${dow}`,
      dayOfWeek: dow,
      focus,
      title,
      exercises: plannedExercises,
      estimatedMinutes: estimateMinutes(plannedExercises),
    });
  }

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    goal: profile.goal,
    experience: profile.experience,
    daysPerWeek: days,
    days: workoutDays,
  };
}

export function focusLabel(focus: DayFocus): string {
  return FOCUS_LABELS[focus];
}

export const WEEKDAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const WEEKDAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
