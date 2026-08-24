import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';

interface Props {
  total: number;
  currentIndex: number; // 0-based
}

/** Small step indicator used across the onboarding wizard. */
export function ProgressDots({ total, currentIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === currentIndex && styles.dotActive,
            i < currentIndex && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  dotDone: {
    backgroundColor: colors.textSecondary,
  },
});
