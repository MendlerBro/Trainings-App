import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, ScreenContainer, SectionHeader, StatTile } from '../../src/components';
import { getExerciseById } from '../../src/data/exercises';
import { computeStreak, totalWorkouts, weeklyCompletedCount } from '../../src/lib/stats';
import { useApp } from '../../src/store/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import { formatGermanDate } from '../../src/utils/date';

export default function ProgressScreen() {
  const { plan, logs } = useApp();

  const streak = useMemo(() => computeStreak(plan, logs), [plan, logs]);
  const total = useMemo(() => totalWorkouts(logs), [logs]);
  const weeklyDone = useMemo(() => weeklyCompletedCount(logs), [logs]);
  const weeklyTarget = plan?.daysPerWeek ?? 0;

  const recentLogs = useMemo(
    () => [...logs].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 20),
    [logs]
  );

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Fortschritt</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatTile label="Workouts gesamt" value={String(total)} />
          <StatTile label="Aktuelle Streak" value={`${streak} 🔥`} accent={streak > 0} />
        </View>
        <View style={styles.statsGrid}>
          <StatTile label="Diese Woche" value={`${weeklyDone}/${weeklyTarget}`} />
          <StatTile label="Ziel" value={weeklyTarget > 0 ? `${weeklyTarget}x / Woche` : '–'} />
        </View>

        <SectionHeader title="Verlauf" />
        {recentLogs.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              Noch keine abgeschlossenen Workouts. Starte dein erstes Training auf dem Heute-Tab!
            </Text>
          </Card>
        ) : (
          recentLogs.map((log) => {
            const dayTitle = plan?.days.find((d) => d.id === log.dayId)?.title ?? 'Training';
            const exerciseNames = log.exercises
              .slice(0, 3)
              .map((e) => getExerciseById(e.exerciseId)?.name)
              .filter(Boolean)
              .join(', ');
            return (
              <Card key={log.id} style={styles.logCard}>
                <View style={styles.logRow}>
                  <View style={styles.logDateBadge}>
                    <Text style={styles.logDateText}>{formatGermanDate(log.dateISO)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logTitle}>{dayTitle}</Text>
                    {exerciseNames ? <Text style={styles.logMeta}>{exerciseNames}</Text> : null}
                  </View>
                  {log.durationMinutes ? (
                    <Text style={styles.logDuration}>{log.durationMinutes} Min.</Text>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDateBadge: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: spacing.sm,
  },
  logDateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  logTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  logMeta: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logDuration: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
});
