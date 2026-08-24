import * as AppleAuthentication from 'expo-apple-authentication';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../src/components';
import { useAuth } from '../src/store/AuthContext';
import { colors, radius, spacing, typography } from '../src/theme';

export default function LoginScreen() {
  const { signInWithApple, signInWithGoogle, isAppleSignInAvailable, authError } = useAuth();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>💪</Text>
          </View>
          <Text style={styles.title}>Trainero</Text>
          <Text style={styles.subtitle}>
            Melde dich an, um deinen persönlichen{'\n'}Trainingsplan zu erstellen und zu speichern.
          </Text>
        </View>

        <View style={styles.buttons}>
          {isAppleSignInAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={radius.md}
              style={styles.appleButton}
              onPress={signInWithApple}
            />
          ) : null}

          <Pressable style={styles.googleButton} onPress={signInWithGoogle}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleButtonText}>Weiter mit Google</Text>
          </Pressable>

          {authError ? <Text style={styles.error}>{authError}</Text> : null}
        </View>

        <Text style={styles.footnote}>
          Mit der Anmeldung stimmst du zu, dass deine Trainingsdaten sicher mit deinem Account
          gespeichert werden, um sie geräteübergreifend verfügbar zu machen.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
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
  buttons: {
    gap: spacing.sm,
  },
  appleButton: {
    height: 54,
    width: '100%',
  },
  googleButton: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: spacing.xs,
  },
  googleButtonText: {
    ...typography.headline,
    color: '#1F1F1F',
  },
  error: {
    ...typography.footnote,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footnote: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
