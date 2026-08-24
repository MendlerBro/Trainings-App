import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components';
import { colors, spacing, typography } from '../../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>💪</Text>
        </View>
        <Text style={styles.title}>Trainero</Text>
        <Text style={styles.subtitle}>
          Dein persönlicher Trainingswochenplan{'\n'}– kostenlos und individuell auf dich zugeschnitten.
        </Text>
      </View>

      <View style={styles.features}>
        <Feature text="In 2 Minuten eingerichtet" />
        <Feature text="Plan passt sich deinem Level, Zielen & Equipment an" />
        <Feature text="Läuft komplett offline, deine Daten bleiben auf deinem Gerät" />
      </View>

      <Button label="Los geht's" onPress={() => router.push('/onboarding/name')} />
    </View>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontSize: 34,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  features: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
