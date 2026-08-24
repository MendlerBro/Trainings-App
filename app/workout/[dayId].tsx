import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ExerciseRow, ScreenContainer } from '../../src/components';
import { getExerciseById } from '../../src/data/exercises';
import { focusLabel } from '../../src/lib/planGenerator';
import { useApp } from '../../src/store/AppContext';
import { CompletedSet, WorkoutLogEntry } from '../../src/types';
import { colors, spacing, typography } from '../../src/theme';
import { generateId } from '../../src/utils/id';
import { todayISODate } from '../../src/utils/date';

export default function WorkoutSessionScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const { plan, logWorkout } = useApp();

  const day = useMemo(() => plan?.days.find((d) => d.id === dayId) ?? null, [plan, dayId]);
  const startedAt = useRef(Date.now());

  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    day?.exercises.forEach((ex) => {
      initial[ex.exerciseId] = ex.sets.map(() => false);
    });
    return initial;
  });

  if (!plan || !day) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>Trainingstag nicht gefunden.</Text>
        <Button label="Zurück" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </ScreenContainer>
    );
  }

  const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const doneSets = Object.values(completedSets).reduce((sum, arr) => sum + arr.filter(Boolean).length, 0);

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setCompletedSets((prev) => {
      const arr = [...(prev[exerciseId] ?? [])];
      arr[setIndex] = !arr[setIndex];
      return { ...prev, [exerciseId]: arr };
    });
  };

  const handleFinish = async () => {
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    const entry: WorkoutLogEntry = {
      id: generateId('log'),
      dateISO: todayISODate(),
      dayId: day.id,
      planId: plan.id,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.map((set, i): CompletedSet => ({
          setNumber: set.setNumber,
          reps: null,
          weightKg: null,
          done: completedSets[ex.exerciseId]?.[i] ?? false,
        })),
      })),
      durationMinutes,
      completedAt: new Date().toISOString(),
    };
    await logWorkout(entry);
    router.back();
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{day.title}</Text>
          <Text style={styles.subtitle}>{focusLabel(day.focus)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {day.exercises.map((plannedExercise) => {
          const exercise = getExerciseById(plannedExercise.exerciseId);
          if (!exercise) return null;
          return (
            <ExerciseRow
              key={plannedExercise.exerciseId}
              exercise={exercise}
              plannedExercise={plannedExercise}
              completedSets={completedSets[plannedExercise.exerciseId] ?? []}
              onToggleSet={(setIndex) => toggleSet(plannedExercise.exerciseId, setIndex)}
              onPressInfo={() => router.push(`/exercise/${exercise.id}`)}
            />
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.progressText}>
          {doneSets}/{totalSets} Sätze erledigt
        </Text>
        <Button label="Training abschließen" onPress={handleFinish} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  progressText: {
    ...typography.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
