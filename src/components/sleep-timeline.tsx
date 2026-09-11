import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { SleepSegment, SleepStage } from '@/types/sleep';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = Spacing.four;
const LABEL_WIDTH = 56;
const CHART_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - LABEL_WIDTH;

const ROW_HEIGHT = 30;
const BAR_THICKNESS = 8;

const STAGE_ORDER: SleepStage[] = [
  SleepStage.AWAKE,
  SleepStage.REM,
  SleepStage.LIGHT_SLEEP,
  SleepStage.DEEP_SLEEP,
];

const STAGE_LABELS: Record<SleepStage, string> = {
  [SleepStage.AWAKE]: 'Awake',
  [SleepStage.REM]: 'REM',
  [SleepStage.LIGHT_SLEEP]: 'Light',
  [SleepStage.DEEP_SLEEP]: 'Deep',
};

const STAGE_COLORS: Record<SleepStage, string> = {
  [SleepStage.AWAKE]: '#FF8A65',
  [SleepStage.REM]: '#9575CD',
  [SleepStage.LIGHT_SLEEP]: '#64B5F6',
  [SleepStage.DEEP_SLEEP]: '#3949AB',
};

const CHART_HEIGHT = ROW_HEIGHT * STAGE_ORDER.length;

type SleepTimelineProps = {
  segments: SleepSegment[];
};

function levelForStage(stage: SleepStage) {
  return STAGE_ORDER.indexOf(stage);
}

export function SleepTimeline({ segments }: SleepTimelineProps) {
  const ordered = useMemo(
    () => [...segments].sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0)),
    [segments]
  );

  const totalDuration = useMemo(
    () => ordered.reduce((sum, s) => sum + (s.duration ?? 0), 0),
    [ordered]
  );

  const bars = useMemo(() => {
    if (totalDuration <= 0) return [];

    let cursor = 0;
    return ordered.map((segment) => {
      const duration = segment.duration ?? 0;
      const start = cursor;
      cursor += duration;

      const x1 = (start / totalDuration) * CHART_WIDTH;
      const x2 = (cursor / totalDuration) * CHART_WIDTH;
      const stage = segment.sleep_stage ?? SleepStage.AWAKE;
      const level = levelForStage(stage);
      const y = level * ROW_HEIGHT + (ROW_HEIGHT - BAR_THICKNESS) / 2;

      return {
        id: `${segment.sleep_id}-${segment.idx}`,
        x1,
        x2: Math.max(x2, x1 + 1),
        y,
        color: STAGE_COLORS[stage],
      };
    });
  }, [ordered, totalDuration]);

  const connectors = useMemo(() => {
    const lines: { x: number; y1: number; y2: number }[] = [];
    for (let i = 1; i < bars.length; i++) {
      const prev = bars[i - 1];
      const curr = bars[i];
      lines.push({
        x: curr.x1,
        y1: prev.y + BAR_THICKNESS / 2,
        y2: curr.y + BAR_THICKNESS / 2,
      });
    }
    return lines;
  }, [bars]);

  return (
    <View style={styles.container}>
      <View style={styles.labelColumn}>
        {STAGE_ORDER.map((stage) => (
          <View key={stage} style={styles.labelRow}>
            <ThemedText type="small" style={styles.labelText}>
              {STAGE_LABELS[stage]}
            </ThemedText>
          </View>
        ))}
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {connectors.map((line, index) => (
          <Line
            key={`connector-${index}`}
            x1={line.x}
            x2={line.x}
            y1={line.y1}
            y2={line.y2}
            stroke="#B0BEC5"
            strokeWidth={1.5}
            strokeDasharray="2,2"
          />
        ))}

        {bars.map((bar) => (
          <Rect
            key={bar.id}
            x={bar.x1}
            y={bar.y}
            width={bar.x2 - bar.x1}
            height={BAR_THICKNESS}
            rx={BAR_THICKNESS / 2}
            fill={bar.color}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  labelColumn: {
    width: LABEL_WIDTH,
  },
  labelRow: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  labelText: {
    opacity: 0.6,
  },
});