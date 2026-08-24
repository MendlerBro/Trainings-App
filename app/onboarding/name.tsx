import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, OnboardingStep } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { useAuth } from '../../src/store/AuthContext';
import { Sex } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Weiblich' },
  { value: 'male', label: 'Männlich' },
  { value: 'unspecified', label: 'Keine Angabe' },
];

export default function NameScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  const { suggestedName } = useAuth();
  const [name, setName] = useState(draft.name || suggestedName || '');
  const [age, setAge] = useState(draft.age ? String(draft.age) : '');

  const canContinue = name.trim().length > 0;

  const handleContinue = () => {
    update({ name: name.trim(), age: age ? Number(age) : null });
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingStep
      stepIndex={0}
      totalSteps={6}
      title="Wie dürfen wir dich nennen?"
      subtitle="Damit sich dein Plan persönlich anfühlt."
      footer={<Button label="Weiter" onPress={handleContinue} disabled={!canContinue} />}
    >
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="z. B. Alex"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <Text style={styles.label}>Alter (optional)</Text>
      <TextInput
        value={age}
        onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
        placeholder="z. B. 28"
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={3}
      />

      <Text style={styles.label}>Geschlecht (optional)</Text>
      <View style={styles.chipsRow}>
        {SEX_OPTIONS.map((opt) => {
          const selected = draft.sex === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => update({ sex: opt.value })}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  chipText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textPrimary,
  },
});
