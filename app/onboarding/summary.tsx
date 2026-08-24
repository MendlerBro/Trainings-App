import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, OnboardingStep } from '../../src/components';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { useApp } from '../../src/store/AppContext';
import { Equipment, ExperienceLevel, TrainingGoal, UserProfile } from '../../src/types';
import { colors, spacing, typography } from '../../src/theme';

const GOAL_LABELS: Record<TrainingGoal, string> = {
  muscle: 'Muskelaufbau',
  strength: 'Kraft steigern',
  fatloss: 'Abnehmen',
  endurance: 'Ausdauer verbessern',
  general: 'Allgemeine Fitness',
};

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Anfänger',
  intermediate: 'Fortgeschritten',
  advanced: 'Profi',
};

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: 'Ohne Geräte',
  home_dumbbells: 'Kurzhanteln zuhause',
  full_gym: 'Fitnessstudio',
};

export default function SummaryScreen() {
  const router = useRouter();
  const { draft } = useOnboarding();
  const { completeOnboarding } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  const isComplete =
    draft.goal != null && draft.experience != null && draft.equipment != null &&
    draft.daysPerWeek != null && draft.sessionDuration != null;

  const handleCreate = async () => {
    if (!isComplete) return;
    setIsSaving(true);
    const profile: UserProfile = {
      name: draft.name || 'Athlet',
      sex: draft.sex,
      age: draft.age,
      goal: draft.goal!,
      experience: draft.experience!,
      daysPerWeek: draft.daysPerWeek!,
      equipment: draft.equipment!,
      sessionDuration: draft.sessionDuration!,
      createdAt: new Date().toISOString(),
    };
    await completeOnboarding(profile);
    router.replace('/(tabs)');
  };

  return (
    <OnboardingStep
      stepIndex={6}
      totalSteps={6}
      title={`Alles klar, ${draft.name || 'du'}!`}
      subtitle="Das ist die Basis für deinen persönlichen Trainingsplan."
      footer={
        <Button label="Trainingsplan erstellen" onPress={handleCreate} disabled={!isComplete} loading={isSaving} />
      }
    >
      <Card style={styles.card}>
        <Row label="Ziel" value={draft.goal ? GOAL_LABELS[draft.goal] : '–'} />
        <Row label="Level" value={draft.experience ? EXPERIENCE_LABELS[draft.experience] : '–'} />
        <Row label="Equipment" value={draft.equipment ? EQUIPMENT_LABELS[draft.equipment] : '–'} />
        <Row label="Trainingstage" value={draft.daysPerWeek ? `${draft.daysPerWeek}x pro Woche` : '–'} />
        <Row label="Dauer" value={draft.sessionDuration ? `${draft.sessionDuration} Minuten` : '–'} last />
      </Card>
      <Text style={styles.note}>
        Du kannst deine Angaben und deinen Plan später jederzeit in deinem Profil anpassen.
      </Text>
    </OnboardingStep>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  note: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
