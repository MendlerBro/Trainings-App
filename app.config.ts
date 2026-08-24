import { ExpoConfig } from 'expo/config';

/**
 * Dynamic app config (instead of app.json) so we can read the Google Sign-In iOS
 * URL scheme from an environment variable — that value is per-Firebase-project and
 * must not be hardcoded. See .env.example / README.md for setup.
 */
const GOOGLE_IOS_URL_SCHEME =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.REPLACE_ME';

// `newArchEnabled` is a valid, documented app.json/app.config key but missing from
// the current `ExpoConfig` TS type — widen just enough to include it.
const config: ExpoConfig & { newArchEnabled?: boolean } = {
  name: 'Trainero',
  slug: 'trainero',
  scheme: 'trainero',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0B0C10',
  newArchEnabled: true,
  primaryColor: '#B8FF5A',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.mendlerbro.trainero',
    buildNumber: '1',
    infoPlist: {
      UIBackgroundModes: [],
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.mendlerbro.trainero',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#0B0C10',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0B0C10',
      },
    ],
    'expo-apple-authentication',
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: GOOGLE_IOS_URL_SCHEME,
      },
    ],
    [
      'expo-build-properties',
      {
        // Common requirement for the native Google Sign-In (Swift) SDK under Expo prebuild.
        ios: { useFrameworks: 'static' },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
    },
  },
};

export default config;
