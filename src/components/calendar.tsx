import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VISIBLE_DAYS = 3;
const HORIZONTAL_PADDING = Spacing.four;
const ITEM_GAP = 8;
const { height } = Dimensions.get('window');

const STRIP_HEIGHT = height * 0.55;

// Fit exactly VISIBLE_DAYS items (+ gaps) inside the available width.
const ITEM_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - ITEM_GAP * (VISIBLE_DAYS - 1)) /
  VISIBLE_DAYS;



const RANGE_DAYS = 60; // how many days before/after today to render

type DayItem = {
  date: Date;
  key: string;
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function generateDays(range: number): DayItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: DayItem[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ date: d, key: d.toISOString().split('T')[0] });
  }
  return days;
}

type DateStripProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const listRef = useRef<FlatList<DayItem>>(null);
  const days = useMemo(() => generateDays(RANGE_DAYS), []);
  const todayIndex = useMemo(
    () => days.findIndex((d) => isSameDay(d.date, new Date())),
    [days]
  );

  useEffect(() => {
    if (todayIndex < 0) return;

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: todayIndex,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [todayIndex]);

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
        });
      }, 100);
    },
    []
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_WIDTH + ITEM_GAP,
      offset: (ITEM_WIDTH + ITEM_GAP) * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: DayItem }) => {
      const selected = isSameDay(item.date, selectedDate);
      const today = isSameDay(item.date, new Date());

      return (
        <Pressable
          onPress={() => onSelectDate(item.date)}
          style={[styles.item, selected && styles.itemSelected]}
        >
          <ThemedText
            type="small"
            style={[styles.dayLabel, selected && styles.dayLabelSelected]}
          >
            {DAY_LABELS[item.date.getDay()]}
          </ThemedText>
          <ThemedText
            type="default"
            style={[
              styles.dayNumber,
              selected && styles.dayNumberSelected,
              today && !selected && styles.dayNumberToday,
            ]}
          >
            {item.date.getDate()}
          </ThemedText>
        </Pressable>
      );
    },
    [selectedDate, onSelectDate]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        contentContainerStyle={styles.contentContainer}
        snapToInterval={ITEM_WIDTH + ITEM_GAP}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: STRIP_HEIGHT,
    alignSelf: 'stretch',
  },

  contentContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: ITEM_GAP,
    alignItems: 'center',
  },

  item: {
    width: ITEM_WIDTH,
    height: STRIP_HEIGHT,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    // Make each date visible against the black background
    backgroundColor: '#1A1A1A',
  },

  itemSelected: {
    backgroundColor: '#6C5CE7',
  },

  dayLabel: {
    color: '#FFFFFF',
    opacity: 0.6,
  },

  dayLabelSelected: {
    opacity: 1,
    color: '#FFFFFF',
  },

  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  dayNumberSelected: {
    color: '#FFFFFF',
  },

  dayNumberToday: {
    color: '#6C5CE7',
  },
});