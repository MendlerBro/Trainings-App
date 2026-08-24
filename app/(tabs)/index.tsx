import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ScreenContainer, StatTile } from '../../src/components';
import { focusLabel, WEEKDAY_SHORT } from '../../src/lib/planGenerator';
import { computeStreak, totalWorkouts } from '../../src/lib/stats';
import { useApp } from '../../src/store/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import { mondayBasedWeekday, todayISODate } from '../../src/utils/date';

const FOCUS_MUSCLE_ICON: Record<string, string> = {
  full_body: '🔥',
  upper: '💪',
  lower: '🦵',
  push: '➡️',
  pull: '⬅️',
  legs: '🦵',
  rest: '🌙',
  cardio: '🏃',
};

export default function TodayScreen() {
  const router = useRouter();
  const { profile, plan, logs } = useApp();

  const today = todayISODate();
  const todayDow = mondayBasedWeekday();
  const todayPlan = plan?.days.find((d) => d.dayOfWeek === todayDow) ?? null;
  const doneToday = useMemo(
    () => (todayPlan ? logs.some((l) => l.dateISO === today && l.dayId === todayPlan.id) : false),
    [logs, today, todayPlan]
  );

  const streak = useMemo(() => computeStreak(plan, logs), [plan, logs]);
  const total = useMemo(() => totalWorkouts(logs), [logs]);

  const firstName = profile?.name?.split(' ')[0] || 'Athlet';

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hallo, {firstName} 👋</Text>
          <Text style={styles.dateText}>{formatToday()}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="Workouts gesamt" value={String(total)} />
          <StatTile label="Streak" value={`${streak} 🔥`} accent={streak > 0} />
        </View>

        <Text style={styles.sectionTitle}>Heute</Text>

        {!todayPlan || todayPlan.focus === 'rest' ? (
          <Card style={styles.restCard}>
            <Text style={styles.restEmoji}>🌙</Text>
            <Text style={styles.restTitle}>Ruhetag</Text>
            <Text style={styles.restSubtitle}>Gönn deinem Körper Erholung – morgen geht's weiter.</Text>
          </Card>
        ) : (
          <Card elevated style={styles.workoutCard}>
            <View style={styles.workoutHeaderRow}>
              <Text style={styles.workoutEmoji}>{FOCUS_MUSCLE_ICON[todayPlan.focus] ?? '💪'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutTitle}>{todayPlan.title}</Text>
                <Text style={styles.workoutMeta}>
                  {focusLabel(todayPlan.focus)} · {todayPlan.exercises.length} Übungen · ~{todayPlan.estimatedMinutes} Min.
                </Text>
              </View>
            </View>

            {doneToday ? (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>✓ Heute erledigt</Text>
              </View>
            ) : null}

            <Button
              label={doneToday ? 'Nochmal trainieren' : 'Training starten'}
              variant={doneToday ? 'secondary' : 'primary'}
              onPress={() => router.push(`/workout/${todayPlan.id}`)}
              style={styles.startButton}
            />
          </Card>
        )}

        <Text style={styles.sectionTitle}>Diese Woche</Text>
        <Card style={styles.weekCard}>
          <View style={styles.weekRow}>
            {plan?.days.map((day) => {
              const isToday = day.dayOfWeek === todayDow;
              const isRest = day.focus === 'rest';
              const isDone = logs.some((l) => l.dayId === day.id && weekdayFromISO(l.dateISO) === day.dayOfWeek && isCurrentWeek(l.dateISO));
              return (
                <View key={day.id} style={styles.weekDay}>
                  <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>
                    {WEEKDAY_SHORT[day.dayOfWeek]}
                  </Text>
                  <View
                    style={[
                      styles.weekDot,
                      isRest && styles.weekDotRest,
                      isDone && styles.weekDotDone,
                      isToday && styles.weekDotToday,
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function weekdayFromISO(iso: string): number {
  return mondayBasedWeekday(new Date(`${iso}T12:00:00`));
}

function isCurrentWeek(iso: string): boolean {
  const now = new Date();
  const dow = mondayBasedWeekday(now);
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  const mondayISO = new Date(monday.getTime() - monday.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return iso >= mondayISO;
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
  greeting: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  dateText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  restCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  restEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  restTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  restSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  workoutCard: {
    marginBottom: spacing.lg,
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  workoutEmoji: {
    fontSize: 30,
    marginRight: spacing.sm,
  },
  workoutTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  workoutMeta: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  doneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: spacing.sm,
  },
  doneBadgeText: {
    ...typography.caption,
    color: colors.accent,
  },
  startButton: {
    marginTop: spacing.xs,
  },
  weekCard: {
    marginBottom: spacing.lg,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  weekDayLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  weekDayLabelToday: {
    color: colors.textPrimary,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  weekDotRest: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekDotDone: {
    backgroundColor: colors.accent,
  },
  weekDotToday: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
});
