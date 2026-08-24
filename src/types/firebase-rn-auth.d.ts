import type { Persistence } from '@firebase/auth';

/**
 * `@firebase/auth`'s package.json `exports["."]` lists a top-level `types` key
 * ahead of the `react-native` condition, so TypeScript always resolves to the
 * generic `auth-public.d.ts` and never sees the React-Native-only exports —
 * even though Metro correctly picks the React Native build at runtime (verified:
 * `dist/rn/index.js` does export this function). This augmentation restores the
 * type for `getReactNativePersistence` so the app can import and use it safely.
 */
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
