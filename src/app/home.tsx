import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateStrip } from '@/components/calendar';
import { ThemedView } from '@/components/themed-view';
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <DateStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },

  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'stretch',
  },
});