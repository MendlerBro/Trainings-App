import { Redirect } from 'expo-router';

import { useApp } from '../src/store/AppContext';
import { useAuth } from '../src/store/AuthContext';

/** Entry gate: routes to login, onboarding, or the main tabs depending on saved state. */
export default function Index() {
  const { user } = useAuth();
  const { onboardingComplete } = useApp();

  if (!user) return <Redirect href="/login" />;
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding/welcome'} />;
}
