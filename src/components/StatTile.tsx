import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

interface Props {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatTile({ label, value, accent }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'flex-start',
  },
  value: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  valueAccent: {
    color: colors.accent,
  },
  label: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
