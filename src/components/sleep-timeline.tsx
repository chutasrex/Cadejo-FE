import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { SleepSegment, SleepStage } from '@/types/sleep';

const HORIZONTAL_PADDING = Spacing.four;
const LABEL_WIDTH = 56;

const ROW_HEIGHT = 64;
const LINE_THICKNESS = 8;

const TOP_PADDING = 20;
const BOTTOM_PADDING = 36;

const STAGE_ORDER: SleepStage[] = [
  SleepStage.AWAKE,
  SleepStage.LIGHT_SLEEP,
  SleepStage.DEEP_SLEEP,
  SleepStage.REM,

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

const CHART_HEIGHT =
  TOP_PADDING +
  STAGE_ORDER.length * ROW_HEIGHT +
  BOTTOM_PADDING;

const PLOT_TOP = TOP_PADDING;

const PLOT_BOTTOM =
  TOP_PADDING +
  STAGE_ORDER.length * ROW_HEIGHT;

type SleepTimelineProps = {
  segments: SleepSegment[];
};

function levelForStage(stage: SleepStage) {
  return STAGE_ORDER.indexOf(stage);
}

function formatTime(value: string | Date) {
  const date = new Date(value);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function SleepTimeline({
  segments,
}: SleepTimelineProps) {
  /*
   * IMPORTANT:
   *
   * We don't calculate the chart width from Dimensions.
   * The chart needs to know its ACTUAL rendered width.
   */
  const [chartWidth, setChartWidth] = useState(0);

  const ordered = useMemo(
    () =>
      [...segments]
        .filter(
          (segment) =>
            segment.starts_at != null &&
            segment.ends_at != null &&
            segment.sleep_stage != null
        )
        .sort(
          (a, b) =>
            new Date(a.starts_at!).getTime() -
            new Date(b.starts_at!).getTime()
        ),
    [segments]
  );

  const timeline = useMemo(() => {
    if (!ordered.length) {
      return null;
    }

    const start = new Date(
      ordered[0].starts_at!
    ).getTime();

    const end = new Date(
      ordered[ordered.length - 1].ends_at!
    ).getTime();

    return {
      start,
      end,
      duration: end - start,
    };
  }, [ordered]);

  /*
   * Don't render the SVG until React Native has measured
   * the actual available width.
   */
  if (!ordered.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: HORIZONTAL_PADDING,
        },
      ]}
    >
      {/* Labels */}
      <View style={styles.labelColumn}>
        {STAGE_ORDER.map((stage) => (
          <View
            key={stage}
            style={styles.labelRow}
          >
            <ThemedText
              type="small"
              style={styles.labelText}
            >
              {STAGE_LABELS[stage]}
            </ThemedText>
          </View>
        ))}

        <View style={styles.timeSpacer} />
      </View>

      {/* Actual chart width */}
      <View
        style={styles.chartContainer}
        onLayout={(event) => {
          const width =
            event.nativeEvent.layout.width;

          setChartWidth(width);
        }}
      >
        {chartWidth > 0 && timeline && (
          <TimelineSvg
            segments={ordered}
            timeline={timeline}
            chartWidth={chartWidth}
          />
        )}
      </View>
    </View>
  );
}

type TimelineSvgProps = {
  segments: SleepSegment[];
  timeline: {
    start: number;
    end: number;
    duration: number;
  };
  chartWidth: number;
};

function TimelineSvg({
  segments,
  timeline,
  chartWidth,
}: TimelineSvgProps) {
  /*
   * Keep the center of the rounded line caps away from
   * the SVG edge.
   *
   * With an 8px line:
   *
   *   |---- 8px ----|
   *   ^             ^
   *   cap           cap
   *
   * Each cap extends 4px beyond its coordinate.
   */
  const inset = LINE_THICKNESS / 2;

  const plotLeft = inset;
  const plotRight = chartWidth - inset;
  const plotWidth = plotRight - plotLeft;

  const xForTime = (timestamp: number) => {
    if (timeline.duration <= 0) {
      return plotLeft;
    }

    const progress =
      (timestamp - timeline.start) /
      timeline.duration;

    /*
     * Clamp the normalized value FIRST.
     */
    const clampedProgress = Math.max(
      0,
      Math.min(1, progress)
    );

    /*
     * Then map it into the inset plot area.
     */
    return (
      plotLeft +
      clampedProgress * plotWidth
    );
  };

  const yForStage = (stage: SleepStage) => {
    const level = levelForStage(stage);

    const insetY = LINE_THICKNESS / 2;

    const minY = PLOT_TOP + insetY;
    const maxY = PLOT_BOTTOM - insetY;

    const y =
      PLOT_TOP +
      level * ROW_HEIGHT +
      ROW_HEIGHT / 2;

    return Math.max(
      minY,
      Math.min(maxY, y)
    );
  };

  const bars = segments.map((segment) => {
    const start = new Date(
      segment.starts_at!
    ).getTime();

    const end = new Date(
      segment.ends_at!
    ).getTime();

    const stage = segment.sleep_stage!;

    return {
      id: `${segment.sleep_id}-${segment.idx}`,
      x1: xForTime(start),
      x2: xForTime(end),
      y: yForStage(stage),
      stage,
      color: STAGE_COLORS[stage],
      start,
    };
  });

  /*
   * Only create transitions when the actual stage changes.
   */
  const transitions = bars.slice(1).flatMap(
    (bar, index) => {
      const previous = bars[index];

      if (previous.stage === bar.stage) {
        return [];
      }

      return [
        {
          x: bar.x1,
          fromY: previous.y,
          toY: bar.y,
          color: bar.color,
        },
      ];
    }
  );

  /*
   * Every segment start, plus the final segment end.
   */
  const timeMarkers = [
    ...segments.map((segment) => {
      const timestamp = new Date(
        segment.starts_at!
      ).getTime();

      return {
        x: xForTime(timestamp),
        timestamp,
        label: formatTime(segment.starts_at!),
      };
    }),

    {
      x: xForTime(
        new Date(
          segments[segments.length - 1].ends_at!
        ).getTime()
      ),
      timestamp: new Date(
        segments[segments.length - 1].ends_at!
      ).getTime(),
      label: formatTime(
        segments[segments.length - 1].ends_at!
      ),
    },
  ];

  return (
    <>
      <Svg
        width={chartWidth}
        height={CHART_HEIGHT}
      >
        {/* Horizontal stage guides */}
        {STAGE_ORDER.map((stage) => {
          const y = yForStage(stage);

          return (
            <Line
              key={`guide-${stage}`}
              x1={plotLeft}
              x2={plotRight}
              y1={y}
              y2={y}
              stroke="#FFFFFF"
              strokeOpacity={0.08}
              strokeWidth={1}
              strokeDasharray="4,6"
            />
          );
        })}

        {/* Vertical stage-change markers */}
        {transitions.map((transition, index) => (
          <Line
            key={`marker-${index}`}
            x1={transition.x}
            x2={transition.x}
            y1={PLOT_TOP}
            y2={PLOT_BOTTOM}
            stroke="#FFFFFF"
            strokeOpacity={0.2}
            strokeWidth={1}
            strokeDasharray="3,5"
          />
        ))}

        {/* Sleep-stage lines */}
        {bars.map((bar) => (
          <Line
            key={bar.id}
            x1={bar.x1}
            x2={bar.x2}
            y1={bar.y}
            y2={bar.y}
            stroke={bar.color}
            strokeWidth={LINE_THICKNESS}
            strokeLinecap="round"
          />
        ))}

        {/* Actual stage transitions */}
        {transitions.map((transition, index) => (
          <Line
            key={`transition-${index}`}
            x1={transition.x}
            x2={transition.x}
            y1={transition.fromY}
            y2={transition.toY}
            stroke={transition.color}
            strokeWidth={LINE_THICKNESS}
            strokeLinecap="round"
          />
        ))}
      </Svg>

      {/* X-axis timestamps */}
      <View
        style={[
          styles.timeLabels,
          { width: chartWidth },
        ]}
      >
        {timeMarkers.map((marker, index) => {
          const labelWidth = 44;

          /*
           * Clamp the TEXT independently so that the
           * label can't overflow either side.
           */
          const left = Math.max(
            0,
            Math.min(
              chartWidth - labelWidth,
              marker.x - labelWidth / 2
            )
          );

          return (
            <ThemedText
              key={`${marker.timestamp}-${index}`}
              type="small"
              style={[
                styles.timeLabel,
                { left },
              ]}
            >
              {marker.label}
            </ThemedText>
          );
        })}
      </View>
    </>
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

  timeSpacer: {
    height: BOTTOM_PADDING,
  },

  chartContainer: {
    flex: 1,
    minWidth: 0,
  },

  timeLabels: {
    height: BOTTOM_PADDING,
    position: 'relative',
  },

  timeLabel: {
    position: 'absolute',
    width: 44,
    textAlign: 'center',
    fontSize: 10,
    opacity: 0.6,
  },
});

