import { TrainingPlan, WorkoutLogEntry } from '../types';
import { mondayBasedWeekday, todayISODate } from '../utils/date';

function isoDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

/**
 * Consecutive-day streak: walks backward from today. Rest days (per the plan's
 * weekly schedule) are skipped without breaking the streak; a scheduled training
 * day without a log breaks it — except "today", which is allowed to be pending.
 */
export function computeStreak(plan: TrainingPlan | null, logs: WorkoutLogEntry[]): number {
  if (!plan) return 0;
  const loggedDates = new Set(logs.map((l) => l.dateISO));
  const today = todayISODate();

  let streak = 0;
  for (let offset = 0; offset < 365; offset++) {
    const dateISO = isoDateNDaysAgo(offset);
    const dow = mondayBasedWeekday(new Date(`${dateISO}T12:00:00`));
    const day = plan.days.find((d) => d.dayOfWeek === dow);
    const isRestDay = !day || day.focus === 'rest';

    if (isRestDay) continue;

    if (loggedDates.has(dateISO)) {
      streak += 1;
      continue;
    }

    if (dateISO === today) {
      // Today's workout may simply not be done yet — don't break the streak on it.
      continue;
    }

    break;
  }

  return streak;
}

export function totalWorkouts(logs: WorkoutLogEntry[]): number {
  return logs.length;
}

/** Number of distinct scheduled training days completed within the current Mon-Sun week. */
export function weeklyCompletedCount(logs: WorkoutLogEntry[]): number {
  const now = new Date();
  const dow = mondayBasedWeekday(now);
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  const mondayISO = new Date(monday.getTime() - monday.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  return logs.filter((l) => l.dateISO >= mondayISO).length;
}
