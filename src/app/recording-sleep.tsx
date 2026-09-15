import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RecordingSleepScreen() {
  const router = useRouter();
  const { nightId } = useLocalSearchParams<{ nightId: string }>();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ThemedText type="default">← Back</ThemedText>
        </Pressable>

        <ThemedText type="title">
          Recording Sleep
        </ThemedText>

        <ThemedText type="default" style={styles.status}>
          Recording sleep for night {nightId}
        </ThemedText>

        <Pressable style={styles.stopButton}>
          <ThemedText style={styles.stopButtonText}>
            Stop Recording
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  safeArea: {
    flex: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'stretch',
  },

  backButton: {
    paddingVertical: Spacing.two ?? 8,
  },

  status: {
    opacity: 0.6,
  },

  stopButton: {
    backgroundColor: '#E57373',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
  },

  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});