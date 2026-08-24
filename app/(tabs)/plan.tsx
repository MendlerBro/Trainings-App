import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, ScreenContainer } from '../../src/components';
import { focusLabel, WEEKDAY_LABELS } from '../../src/lib/planGenerator';
import { useApp } from '../../src/store/AppContext';
import { colors, spacing, typography } from '../../src/theme';
import { mondayBasedWeekday } from '../../src/utils/date';

export default function PlanScreen() {
  const router = useRouter();
  const { plan } = useApp();
  const todayDow = mondayBasedWeekday();

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dein Wochenplan</Text>
          <Text style={styles.subtitle}>
            {plan ? `${plan.daysPerWeek}x Training pro Woche` : 'Noch kein Plan vorhanden'}
          </Text>
        </View>

        {plan?.days.map((day) => {
          const isToday = day.dayOfWeek === todayDow;
          const isRest = day.focus === 'rest';
          return (
            <Card
              key={day.id}
              style={StyleSheet.flatten([styles.dayCard, isToday && styles.dayCardToday])}
              onPress={isRest ? undefined : () => router.push(`/workout/${day.id}`)}
            >
              <View style={styles.dayRow}>
                <View style={styles.weekdayPill}>
                  <Text style={styles.weekdayPillText}>{WEEKDAY_LABELS[day.dayOfWeek].slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayTitle}>{isRest ? 'Ruhetag' : day.title}</Text>
                  <Text style={styles.dayMeta}>
                    {isRest
                      ? 'Kein Training geplant'
                      : `${focusLabel(day.focus)} · ${day.exercises.length} Übungen · ~${day.estimatedMinutes} Min.`}
                  </Text>
                </View>
                {!isRest ? <Text style={styles.chevron}>›</Text> : null}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayCard: {
    marginBottom: spacing.sm,
  },
  dayCardToday: {
    borderColor: colors.accent,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekdayPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  weekdayPillText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  dayMeta: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: 22,
    marginLeft: spacing.xs,
  },
});
