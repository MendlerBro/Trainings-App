import { Stack } from 'expo-router';

import { OnboardingProvider } from '../../src/store/OnboardingContext';
import { ScreenContainer } from '../../src/components';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <ScreenContainer edges={['top', 'bottom']}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </ScreenContainer>
    </OnboardingProvider>
  );
}
