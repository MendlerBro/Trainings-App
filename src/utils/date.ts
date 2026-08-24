/** Returns the ISO date (yyyy-mm-dd) for "today" in the device's local time. */
export function todayISODate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Monday-based weekday index (0=Mon..6=Sun) for a given Date, in local time. */
export function mondayBasedWeekday(date: Date = new Date()): number {
  const jsDay = date.getDay(); // 0=Sun..6=Sat
  return (jsDay + 6) % 7;
}

export function isSameISODate(a: string, b: string): boolean {
  return a === b;
}

export function formatGermanDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}
