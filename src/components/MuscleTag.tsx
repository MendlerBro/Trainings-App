import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { muscleGroupColors } from '../theme';
import { MuscleGroup } from '../types';

const LABELS: Record<MuscleGroup, string> = {
  chest: 'Brust',
  back: 'Rücken',
  legs: 'Beine',
  shoulders: 'Schultern',
  arms: 'Arme',
  core: 'Bauch',
  cardio: 'Cardio',
  fullBody: 'Ganzkörper',
};

export function muscleGroupLabel(group: MuscleGroup): string {
  return LABELS[group];
}

export function MuscleTag({ group }: { group: MuscleGroup }) {
  const color = muscleGroupColors[group];
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{LABELS[group]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
