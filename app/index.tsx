import { Redirect } from 'expo-router';

import { useApp } from '../src/store/AppContext';

/** Entry gate: routes to onboarding or the main tabs depending on saved state. */
export default function Index() {
  const { onboardingComplete } = useApp();
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding/welcome'} />;
}
