import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import { Exercise, PlannedExercise } from '../types';

interface Props {
  exercise: Exercise;
  plannedExercise: PlannedExercise;
  completedSets: boolean[];
  onToggleSet: (setIndex: number) => void;
  onPressInfo: () => void;
}

export function ExerciseRow({ exercise, plannedExercise, completedSets, onToggleSet, onPressInfo }: Props) {
  const allDone = completedSets.every(Boolean);

  return (
    <View style={[styles.card, allDone && styles.cardDone]}>
      <Pressable onPress={onPressInfo} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>
            {plannedExercise.sets.length} Sätze · {plannedExercise.sets[0]?.targetReps} Wdh. · {plannedExercise.restSeconds}s Pause
          </Text>
        </View>
        <Text style={styles.infoIcon}>ⓘ</Text>
      </Pressable>

      <View style={styles.setsRow}>
        {plannedExercise.sets.map((set, i) => {
          const done = completedSets[i];
          return (
            <Pressable
              key={set.setNumber}
              onPress={() => onToggleSet(i)}
              style={[styles.setChip, done && styles.setChipDone]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
            >
              <Text style={[styles.setChipText, done && styles.setChipTextDone]}>
                {done ? '✓' : set.setNumber}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardDone: {
    borderColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoIcon: {
    color: colors.textTertiary,
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  setsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  setChip: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setChipDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  setChipText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  setChipTextDone: {
    color: colors.background,
    fontWeight: '700',
  },
});
