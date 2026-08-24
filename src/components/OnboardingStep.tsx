import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { ProgressDots } from './ProgressDots';

interface Props {
  stepIndex: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
}

/** Shared chrome for every onboarding step: back button, progress dots, title, scrollable content, footer. */
export function OnboardingStep({ stepIndex, totalSteps, title, subtitle, children, footer, showBack = true }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {showBack && router.canGoBack() ? (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.dotsWrap}>
          <ProgressDots total={totalSteps} currentIndex={stepIndex} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </ScrollView>

      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 28,
    marginTop: -4,
  },
  dotsWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    marginTop: spacing.lg,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
