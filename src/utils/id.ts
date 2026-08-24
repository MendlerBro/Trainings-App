/** Lightweight unique id generator — no external uuid dependency needed for local-only data. */
export function generateId(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}
