import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function AddEvents() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">
        Events
      </ThemedText>

      <View style={styles.eventsContainer}>
        <ThemedText type="small" style={styles.emptyText}>
          No events yet
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two ?? 8,
  },

  eventsContainer: {
    gap: Spacing.two ?? 8,
  },

  emptyText: {
    opacity: 0.5,
  },
});
