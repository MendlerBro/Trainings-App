import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  padded?: boolean;
}

/** Standard full-screen wrapper: background color + safe area handling. */
export function ScreenContainer({ children, style, edges = ['top', 'bottom'], padded = true }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
