/**
 * Single dark, clean color palette. The app ships with one deliberate theme
 * rather than light/dark switching — keeps the "premium app" look consistent.
 */
export const colors = {
  background: '#0B0C10',
  backgroundElevated: '#14151C',
  surface: '#1B1D26',
  surfaceHigh: '#242631',
  border: '#2A2C38',
  borderSubtle: '#1F212B',

  textPrimary: '#F5F6FA',
  textSecondary: '#9A9CAD',
  textTertiary: '#63657A',

  accent: '#B8FF5A',
  accentMuted: 'rgba(184, 255, 90, 0.14)',
  accentPressed: '#A3E64F',

  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#FB6B6B',
  info: '#5AA9FF',

  overlay: 'rgba(6, 7, 10, 0.72)',
} as const;

export type MuscleGroupColorKey = keyof typeof muscleGroupColors;

/** Small accent tints used to visually distinguish muscle-group tags. */
export const muscleGroupColors = {
  chest: '#FF8A65',
  back: '#5AA9FF',
  legs: '#B8FF5A',
  shoulders: '#FFD54F',
  arms: '#FF6B9E',
  core: '#4ADE80',
  cardio: '#5AA9FF',
  fullBody: '#B8FF5A',
} as const;
