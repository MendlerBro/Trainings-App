import { Stack } from 'expo-router';

import { OnboardingProvider } from '../../src/store/OnboardingContext';
import { ScreenContainer } from '../../src/components';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <ScreenContainer edges={['top', 'bottom']}>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      </ScreenContainer>
    </OnboardingProvider>
  );
}
