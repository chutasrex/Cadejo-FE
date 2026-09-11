import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { SleepSegment, SleepStage } from '@/types/sleep';

const STAGE_ORDER: SleepStage[] = [
  SleepStage.DEEP_SLEEP,
  SleepStage.LIGHT_SLEEP,
  SleepStage.REM,
  SleepStage.AWAKE,
];

const STAGE_LABELS: Record<SleepStage, string> = {
  [SleepStage.AWAKE]: 'Awake',
  [SleepStage.REM]: 'REM',
  [SleepStage.LIGHT_SLEEP]: 'Light sleep',
  [SleepStage.DEEP_SLEEP]: 'Deep sleep',
};

const STAGE_COLORS: Record<SleepStage, string> = {
  [SleepStage.AWAKE]: '#FF8A65',
  [SleepStage.REM]: '#9575CD',
  [SleepStage.LIGHT_SLEEP]: '#64B5F6',
  [SleepStage.DEEP_SLEEP]: '#3949AB',
};

// ASSUMPTION: `duration` is in seconds — adjust divisor if it's minutes.
function formatDuration(totalSeconds: number) {
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

type SleepStatsProps = {
  segments: SleepSegment[];
};

export function SleepStats({ segments }: SleepStatsProps) {
  const breakdown = useMemo(() => {
    const durations: Record<SleepStage, number> = {
      [SleepStage.AWAKE]: 0,
      [SleepStage.REM]: 0,
      [SleepStage.LIGHT_SLEEP]: 0,
      [SleepStage.DEEP_SLEEP]: 0,
    };

    for (const segment of segments) {
      if (!segment.sleep_stage) continue;
      durations[segment.sleep_stage] += segment.duration ?? 0;
    }

    const asleepTotal =
      durations[SleepStage.REM] +
      durations[SleepStage.LIGHT_SLEEP] +
      durations[SleepStage.DEEP_SLEEP];

    return STAGE_ORDER.map((stage) => ({
      stage,
      duration: durations[stage],
      percent:
        stage === SleepStage.AWAKE
          ? null
          : asleepTotal > 0
            ? Math.round((durations[stage] / asleepTotal) * 100)
            : 0,
    }));
  }, [segments]);

  return (
    <View style={styles.container}>
      {breakdown.map(({ stage, duration, percent }) => (
        <View key={stage} style={styles.row}>
          <View style={styles.labelGroup}>
            <View style={[styles.dot, { backgroundColor: STAGE_COLORS[stage] }]} />
            <ThemedText type="default">{STAGE_LABELS[stage]}</ThemedText>
          </View>
          <View style={styles.valueGroup}>
            {percent !== null && (
              <ThemedText type="small" style={styles.percent}>
                {percent}%
              </ThemedText>
            )}
            <ThemedText type="default" style={styles.duration}>
              {formatDuration(duration)}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two ?? 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percent: {
    opacity: 0.5,
  },
  duration: {
    fontWeight: '600',
    minWidth: 56,
    textAlign: 'right',
  },
});