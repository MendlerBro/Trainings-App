import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from '../src/store/AppContext';
import { AuthProvider, useAuth } from '../src/store/AuthContext';
import { colors } from '../src/theme';

// Keep the native splash screen visible until auth state + stored app data have been restored.
SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op: splash screen module can reject if already hidden — safe to ignore
});

// Avoids a white flash behind the app during startup/orientation changes.
SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});

function RootNavigator() {
  const { isAuthLoading } = useAuth();
  const { isLoading } = useApp();
  const stillLoading = isAuthLoading || isLoading;

  useEffect(() => {
    if (!stillLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [stillLoading]);

  if (stillLoading) {
    // Native splash screen is still visible at this point.
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workout/[dayId]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="exercise/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
