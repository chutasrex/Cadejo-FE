import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SleepStats } from '@/components/sleep-stats';
import { SleepTimeline } from '@/components/sleep-timeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNights } from '@/hooks/use-night';
import { QualityOfSleep } from '@/types/sleep';
import { useMemo } from 'react';

function formatFullDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTotalDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

const QUALITY_COLORS: Record<QualityOfSleep, string> = {
  [QualityOfSleep.POOR]: '#E57373',
  [QualityOfSleep.FAIR]: '#FFB74D',
  [QualityOfSleep.GOOD]: '#81C784',
  [QualityOfSleep.EXCELLENT]: '#4CAF50',
};

export default function DayDetailedScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const parsedDate = date ? new Date(date) : new Date();

  const { data: nights, isLoading, isError, error } = useNights();

  const night = useMemo(
    () => nights?.find((night) => night.date === date),
    [nights, date],
  )

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="default">← Back</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.dateLabel}>
          {formatFullDate(parsedDate)}
        </ThemedText>

        {isLoading && <ThemedText type="default">Loading…</ThemedText>}

        {isError && (
          <ThemedText type="default" style={styles.errorText}>
            Couldn't load this night: {(error as Error)?.message ?? 'unknown error'}
          </ThemedText>
        )}

        {!isLoading && !isError && !night?.sleep && (
          <ThemedText type="default" style={styles.placeholder}>
            No sleep logged for this night.
          </ThemedText>
        )}

        {night?.sleep && (
          <>
            <View style={styles.header}>
              {night.sleep.quality_of_sleep && (
                <View
                  style={[
                    styles.qualityBadge,
                    { backgroundColor: QUALITY_COLORS[night.sleep.quality_of_sleep] },
                  ]}
                >
                  <ThemedText type="small" style={styles.qualityText}>
                    {night.sleep.quality_of_sleep}
                  </ThemedText>
                </View>
              )}
              {night.sleep.duration != null && (
                <ThemedText type="small" style={styles.durationLabel}>
                  {formatTotalDuration(night.sleep.duration)} total
                </ThemedText>
              )}
            </View>

            <ThemedView type="backgroundElement" style={styles.timelineCard}>
              <SleepTimeline segments={night.sleep.sleep_segments} />
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.statsCard}>
              <SleepStats segments={night.sleep.sleep_segments} />
            </ThemedView>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'stretch',
  },
  backButton: { paddingVertical: Spacing.two ?? 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateLabel: { fontSize: 24 },
  qualityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  qualityText: { color: '#fff', fontWeight: '600' },
  durationLabel: { opacity: 0.6 },
  placeholder: { opacity: 0.6 },
  errorText: { color: '#E57373' },
  timelineCard: { padding: Spacing.four, borderRadius: Spacing.four },
  statsCard: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.three },
});