import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nicht gefunden' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Diese Seite gibt es nicht.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Zurück zur Startseite</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  link: {
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.body,
    color: colors.accent,
  },
});
