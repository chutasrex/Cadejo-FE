import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { QualityOfSleep } from '@/types/sleep'; // adjust path to wherever the enum lives

const QUALITY_CONFIG: Record<
  QualityOfSleep,
  { color: string; label: string }
> = {
  [QualityOfSleep.POOR]: { color: '#E57373', label: 'Poor' },
  [QualityOfSleep.MID]: { color: '#FFB74D', label: 'Fair' },
  [QualityOfSleep.GOOD]: { color: '#81C784', label: 'Good' },
  [QualityOfSleep.EXCELLENT]: { color: '#4DD0E1', label: 'Excellent' },
};

type SleepQualityBadgeProps = {
  quality: QualityOfSleep;
};

export function SleepQualityBadge({ quality }: SleepQualityBadgeProps) {
  const { color, label } = QUALITY_CONFIG[quality];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: color,
        },
      ]}
    >
      <ThemedText type="default" style={[styles.label, { color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});