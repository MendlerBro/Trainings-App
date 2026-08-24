import { useRouter } from 'expo-router';

import { OnboardingStep, OptionCard } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { ExperienceLevel } from '../../src/types';

const OPTIONS: { value: ExperienceLevel; title: string; subtitle: string }[] = [
  { value: 'beginner', title: 'Anfänger', subtitle: 'Wenig bis keine Trainingserfahrung' },
  { value: 'intermediate', title: 'Fortgeschritten', subtitle: 'Trainierst seit einigen Monaten regelmäßig' },
  { value: 'advanced', title: 'Profi', subtitle: 'Trainierst seit Jahren strukturiert' },
];

export default function ExperienceScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const handleSelect = (value: ExperienceLevel) => {
    update({ experience: value });
    router.push('/onboarding/equipment');
  };

  return (
    <OnboardingStep
      stepIndex={2}
      totalSteps={7}
      title="Wie ist dein Trainingslevel?"
      subtitle="Damit Übungen und Umfang zu deiner Erfahrung passen."
      footer={null}
    >
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          title={opt.title}
          subtitle={opt.subtitle}
          selected={draft.experience === opt.value}
          onPress={() => handleSelect(opt.value)}
        />
      ))}
    </OnboardingStep>
  );
}
