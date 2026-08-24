import { useRouter } from 'expo-router';

import { OnboardingStep, OptionCard } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { SessionDuration } from '../../src/types';

const OPTIONS: { value: SessionDuration; title: string; subtitle: string }[] = [
  { value: 30, title: '30 Minuten', subtitle: 'Kurz und knackig' },
  { value: 45, title: '45 Minuten', subtitle: 'Solide Trainingseinheit' },
  { value: 60, title: '60 Minuten', subtitle: 'Ausführliches Training' },
  { value: 90, title: '90 Minuten', subtitle: 'Maximales Volumen' },
];

export default function DurationScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const handleSelect = (value: SessionDuration) => {
    update({ sessionDuration: value });
    router.push('/onboarding/summary');
  };

  return (
    <OnboardingStep
      stepIndex={5}
      totalSteps={7}
      title="Wie viel Zeit hast du?"
      subtitle="Pro Trainingseinheit – wir passen die Anzahl der Übungen daran an."
      footer={null}
    >
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          title={opt.title}
          subtitle={opt.subtitle}
          selected={draft.sessionDuration === opt.value}
          onPress={() => handleSelect(opt.value)}
        />
      ))}
    </OnboardingStep>
  );
}
