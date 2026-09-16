import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SleepStats } from '@/components/sleep-stats';
import { SleepTimeline } from '@/components/sleep-timeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View } from 'react-native';

import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
import { useNights, useSleep } from '@/hooks/use-night';
import { SleepQualityBadge } from '@/components/sleep-quality-badge';
import { NightEvents } from '@/components/night-events';

function formatFullDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function DayDetailedScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const parsedDate = date ? new Date(date) : new Date();

  const {
    data: nights,
    isLoading: nightsLoading,
    isError: nightsError,
    error: nightsErrorData,
  } = useNights();

  const night = useMemo(
    () => nights?.find((night) => night.date === date),
    [nights, date],
  );

  const {
    data: sleep,
    isLoading: sleepLoading,
    isError: sleepError,
    error: sleepErrorData,
  } = useSleep(night?.id, night != null && !night.empty);

return (
  <ThemedView style={styles.container}>
    <SafeAreaView style={styles.safeArea}>

      {/* Fixed header */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ThemedText type="default">← Back</ThemedText>
      </Pressable>

      <View style={styles.dateRow}>
        <ThemedText type="title" style={styles.dateLabel}>
          {formatFullDate(parsedDate)}
        </ThemedText>

        {sleep?.quality_of_sleep && (
          <SleepQualityBadge quality={sleep.quality_of_sleep} />
        )}
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {night && night.empty && (
          <Pressable
            style={styles.startButton}
            onPress={() =>
              router.push({
                pathname: '/recording-sleep',
                params: {
                  nightId: String(night.id),
                },
              })
            }
          >
            <ThemedText style={styles.startButtonText}>
              Start Recording Sleep
            </ThemedText>
          </Pressable>
        )}

        {nightsLoading && (
          <ThemedText type="default">
            Loading…
          </ThemedText>
        )}

        {nightsError && (
          <ThemedText type="default" style={styles.errorText}>
            Couldn't load this night:{' '}
            {(nightsErrorData as Error)?.message ?? 'unknown error'}
          </ThemedText>
        )}

        {!nightsLoading && !nightsError && !night && (
          <ThemedText type="default" style={styles.placeholder}>
            No night logged for this date.
          </ThemedText>
        )}

        {night?.empty && (
          <ThemedText type="default" style={styles.placeholder}>
            No sleep logged for this night.
          </ThemedText>
        )}

        {sleepLoading && (
          <ThemedText type="default">
            Loading sleep data…
          </ThemedText>
        )}

        {sleepError && (
          <ThemedText type="default" style={styles.errorText}>
            Couldn't load sleep data:{' '}
            {(sleepErrorData as Error)?.message ?? 'unknown error'}
          </ThemedText>
        )}

        {sleep && (
          <>
            <ThemedView
              type="backgroundElement"
              style={styles.timelineCard}
            >
              <SleepTimeline segments={sleep.sleep_segments} />
            </ThemedView>

            <ThemedView
              type="backgroundElement"
              style={styles.statsCard}
            >
              <SleepStats segments={sleep.sleep_segments} />
            </ThemedView>
          </>
        )}

        {night && !night.empty && (
          <NightEvents nightId={night.id} />
        )}
      </ScrollView>
    </SafeAreaView>
  </ThemedView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'stretch',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },

  backButton: {
    paddingVertical: Spacing.two ?? 8,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },

  dateLabel: {
    fontSize: 24,
    lineHeight: 28,
    flexShrink: 1,
  },

  timelineCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    marginBottom: Spacing.four,
  },

  statsCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },

  startButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  placeholder: {
    opacity: 0.6,
    marginBottom: Spacing.four,
  },

  errorText: {
    color: '#E57373',
    marginBottom: Spacing.four,
  },
});