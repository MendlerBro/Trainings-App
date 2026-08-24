import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MuscleTag, ScreenContainer } from '../../src/components';
import { getExerciseById } from '../../src/data/exercises';
import { colors, spacing, typography } from '../../src/theme';
import { Equipment } from '../../src/types';

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: 'Kein Equipment nötig',
  home_dumbbells: 'Kurzhanteln / Kettlebell',
  full_gym: 'Fitnessstudio-Ausstattung',
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exercise = id ? getExerciseById(id) : undefined;

  if (!exercise) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Übung nicht gefunden.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.tagsRow}>
          <MuscleTag group={exercise.muscleGroup} />
          {exercise.secondaryMuscles?.map((m) => <MuscleTag key={m} group={m} />)}
        </View>

        <Text style={styles.description}>{exercise.description}</Text>

        <Text style={styles.sectionLabel}>Ausführung</Text>
        {exercise.cues.map((cue, i) => (
          <View key={i} style={styles.cueRow}>
            <Text style={styles.cueBullet}>{i + 1}</Text>
            <Text style={styles.cueText}>{cue}</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Equipment</Text>
        <Text style={styles.equipmentText}>{EQUIPMENT_LABELS[exercise.requiresEquipment]}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  name: {
    ...typography.title1,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  sectionLabel: {
    ...typography.footnote,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  cueRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  cueBullet: {
    ...typography.footnote,
    color: colors.accent,
    fontWeight: '700',
    width: 22,
  },
  cueText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  equipmentText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
