import { Redirect } from 'expo-router';

import { useApp } from '../src/store/AppContext';
import { useAuth } from '../src/store/AuthContext';

/** Entry gate: routes to login, onboarding, or the main tabs depending on saved state. */
export default function Index() {
  const { effectiveUid } = useAuth();
  const { onboardingComplete } = useApp();

  // No Firebase configured yet → guest mode already assigned a local uid, skip login entirely.
  if (!effectiveUid) return <Redirect href="/login" />;
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding/welcome'} />;
}
