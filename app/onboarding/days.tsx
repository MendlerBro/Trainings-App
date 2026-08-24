import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, OnboardingStep } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { colors, spacing, typography } from '../../src/theme';

const DAY_OPTIONS = [2, 3, 4, 5, 6];

export default function DaysScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const handleContinue = () => {
    router.push('/onboarding/duration');
  };

  return (
    <OnboardingStep
      stepIndex={4}
      totalSteps={6}
      title="Wie oft pro Woche?"
      subtitle="Wähle, wie viele Trainingstage realistisch in deine Woche passen."
      footer={<Button label="Weiter" onPress={handleContinue} disabled={draft.daysPerWeek == null} />}
    >
      <View style={styles.row}>
        {DAY_OPTIONS.map((n) => {
          const selected = draft.daysPerWeek === n;
          return (
            <Pressable
              key={n}
              onPress={() => update({ daysPerWeek: n })}
              style={[styles.circle, selected && styles.circleSelected]}
            >
              <Text style={[styles.number, selected && styles.numberSelected]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Tage pro Woche</Text>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  number: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  numberSelected: {
    color: colors.background,
  },
  hint: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
