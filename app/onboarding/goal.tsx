import { useRouter } from 'expo-router';

import { Button, OnboardingStep, OptionCard } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { TrainingGoal } from '../../src/types';

const OPTIONS: { value: TrainingGoal; title: string; subtitle: string }[] = [
  { value: 'muscle', title: 'Muskelaufbau', subtitle: 'Mehr Muskelmasse aufbauen' },
  { value: 'strength', title: 'Kraft steigern', subtitle: 'Stärker werden bei wenigen Wiederholungen' },
  { value: 'fatloss', title: 'Abnehmen', subtitle: 'Fett reduzieren, Muskeln erhalten' },
  { value: 'endurance', title: 'Ausdauer verbessern', subtitle: 'Fitter und ausdauernder werden' },
  { value: 'general', title: 'Allgemeine Fitness', subtitle: 'Gesund und aktiv bleiben' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const handleSelect = (value: TrainingGoal) => {
    update({ goal: value });
    router.push('/onboarding/experience');
  };

  return (
    <OnboardingStep
      stepIndex={1}
      totalSteps={6}
      title="Was ist dein Ziel?"
      subtitle="Das bestimmt Übungsauswahl, Sätze und Wiederholungen deines Plans."
      footer={null}
    >
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          title={opt.title}
          subtitle={opt.subtitle}
          selected={draft.goal === opt.value}
          onPress={() => handleSelect(opt.value)}
        />
      ))}
    </OnboardingStep>
  );
}
