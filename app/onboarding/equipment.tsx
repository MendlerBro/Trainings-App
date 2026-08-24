import { useRouter } from 'expo-router';

import { OnboardingStep, OptionCard } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { Equipment } from '../../src/types';

const OPTIONS: { value: Equipment; title: string; subtitle: string }[] = [
  { value: 'bodyweight', title: 'Zuhause ohne Geräte', subtitle: 'Nur mit dem eigenen Körpergewicht' },
  { value: 'home_dumbbells', title: 'Zuhause mit Kurzhanteln', subtitle: 'Kurzhanteln oder Kettlebell vorhanden' },
  { value: 'full_gym', title: 'Fitnessstudio', subtitle: 'Zugang zu Langhantel, Maschinen & Kabelzug' },
];

export default function EquipmentScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const handleSelect = (value: Equipment) => {
    update({ equipment: value });
    router.push('/onboarding/days');
  };

  return (
    <OnboardingStep
      stepIndex={3}
      totalSteps={6}
      title="Wo trainierst du?"
      subtitle="Wir wählen nur Übungen, die mit deinem Equipment möglich sind."
      footer={null}
    >
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          title={opt.title}
          subtitle={opt.subtitle}
          selected={draft.equipment === opt.value}
          onPress={() => handleSelect(opt.value)}
        />
      ))}
    </OnboardingStep>
  );
}
