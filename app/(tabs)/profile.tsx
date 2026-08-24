import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ScreenContainer, SectionHeader } from '../../src/components';
import { useApp } from '../../src/store/AppContext';
import { Equipment, ExperienceLevel, SessionDuration, TrainingGoal } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

const GOALS: { value: TrainingGoal; label: string }[] = [
  { value: 'muscle', label: 'Muskelaufbau' },
  { value: 'strength', label: 'Kraft' },
  { value: 'fatloss', label: 'Abnehmen' },
  { value: 'endurance', label: 'Ausdauer' },
  { value: 'general', label: 'Fitness' },
];

const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Anfänger' },
  { value: 'intermediate', label: 'Fortgeschritten' },
  { value: 'advanced', label: 'Profi' },
];

const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'bodyweight', label: 'Ohne Geräte' },
  { value: 'home_dumbbells', label: 'Kurzhanteln' },
  { value: 'full_gym', label: 'Fitnessstudio' },
];

const DURATIONS: { value: SessionDuration; label: string }[] = [
  { value: 30, label: '30 Min' },
  { value: 45, label: '45 Min' },
  { value: 60, label: '60 Min' },
  { value: 90, label: '90 Min' },
];

const DAY_COUNTS = [2, 3, 4, 5, 6];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, regeneratePlan, resetApp } = useApp();
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!profile) return null;

  const applyChange = async (updates: Parameters<typeof updateProfile>[0]) => {
    await updateProfile(updates);
    setIsRegenerating(true);
    await regeneratePlan();
    setIsRegenerating(false);
  };

  const handleReset = () => {
    Alert.alert(
      'App zurücksetzen?',
      'Dein Profil, Plan und dein Trainingsverlauf werden dauerhaft gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          {isRegenerating ? <Text style={styles.regeneratingText}>Plan wird aktualisiert…</Text> : null}
        </View>

        <SectionHeader title="Ziel" />
        <Card style={styles.card}>
          <ChipRow options={GOALS} value={profile.goal} onChange={(v) => applyChange({ goal: v })} />
        </Card>

        <SectionHeader title="Trainingslevel" />
        <Card style={styles.card}>
          <ChipRow options={LEVELS} value={profile.experience} onChange={(v) => applyChange({ experience: v })} />
        </Card>

        <SectionHeader title="Equipment" />
        <Card style={styles.card}>
          <ChipRow options={EQUIPMENT} value={profile.equipment} onChange={(v) => applyChange({ equipment: v })} />
        </Card>

        <SectionHeader title="Trainingstage pro Woche" />
        <Card style={styles.card}>
          <View style={styles.daysRow}>
            {DAY_COUNTS.map((n) => {
              const selected = profile.daysPerWeek === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => applyChange({ daysPerWeek: n })}
                  style={[styles.dayCircle, selected && styles.dayCircleSelected]}
                >
                  <Text style={[styles.dayCircleText, selected && styles.dayCircleTextSelected]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <SectionHeader title="Dauer pro Einheit" />
        <Card style={styles.card}>
          <ChipRow options={DURATIONS} value={profile.sessionDuration} onChange={(v) => applyChange({ sessionDuration: v })} />
        </Card>

        <Button
          label="Neuen Plan generieren"
          variant="secondary"
          onPress={async () => {
            setIsRegenerating(true);
            await regeneratePlan();
            setIsRegenerating(false);
          }}
          style={styles.regenerateButton}
        />

        <SectionHeader title="Gefahrenzone" />
        <Card style={styles.card}>
          <Pressable onPress={handleReset}>
            <Text style={styles.dangerText}>App zurücksetzen</Text>
          </Pressable>
        </Card>

        <Text style={styles.footerNote}>Trainero · Deine Daten bleiben lokal auf diesem Gerät.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function ChipRow<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipsWrap}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    ...typography.title1,
    color: colors.accent,
  },
  name: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  regeneratingText: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: 4,
  },
  card: {
    marginBottom: spacing.md,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.backgroundElevated,
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
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayCircleText: {
    ...typography.callout,
    color: colors.textPrimary,
  },
  dayCircleTextSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  regenerateButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  dangerText: {
    ...typography.headline,
    color: colors.danger,
  },
  footerNote: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
