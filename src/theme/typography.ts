import { Platform } from 'react-native';

/** Uses the iOS system font (San Francisco) for a native feel; no custom font loading needed. */
const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

export const typography = {
  fontFamily: systemFont,
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.3 },
  title1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.2 },
  title2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: 0.1 },
  title3: { fontSize: 19, fontWeight: '600' as const },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  callout: { fontSize: 15, fontWeight: '500' as const },
  subhead: { fontSize: 14, fontWeight: '400' as const },
  footnote: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.2 },
} as const;
