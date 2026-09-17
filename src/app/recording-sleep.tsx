import { useLocalSearchParams, useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { SleepEvent } from '@/types/sleep'; // adjust to wherever SleepEvent actually lives
import { useSubmitSleep } from '@/hooks/use-night';



const SAMPLE_INTERVAL_MS = 200; // how often the sensor reports (5Hz)
const CAPTURE_INTERVAL_MS = 5000; // how often we average + snapshot into the events array

type Reading = { x: number; y: number; z: number };

export default function RecordingSleepScreen() {
  const router = useRouter();
  const { nightId } = useLocalSearchParams<{ nightId: string }>();
  const numericNightId = Number(nightId);
  const [events, setEvents] = useState<SleepEvent[]>([]);
  const [isRecording, setIsRecording] = useState(true);

  const { mutate: submitSleep, isPending } = useSubmitSleep(numericNightId);

  // Buffer of raw readings collected since the last capture. Cleared
  // every time we average and push a SleepEvent.
  const samplesRef = useRef<Reading[]>([]);
  const idxRef = useRef(0);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRecording) return;

    Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);

    subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
      samplesRef.current.push({ x, y, z });
    });

    captureIntervalRef.current = setInterval(() => {
      const samples = samplesRef.current;
      samplesRef.current = [];

      if (samples.length === 0) return;

      const sum = samples.reduce(
        (acc, s) => ({ x: acc.x + s.x, y: acc.y + s.y, z: acc.z + s.z }),
        { x: 0, y: 0, z: 0 }
      );
      const count = samples.length;

      const event: SleepEvent = {
        idx: idxRef.current++,
        x: sum.x / count,
        y: sum.y / count,
        z: sum.z / count,
        timestamp: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, event]);
    }, CAPTURE_INTERVAL_MS);

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [isRecording]);

  const handleStop = () => {
    setIsRecording(false);
    submitSleep(events, {
      onSuccess: () => router.back(),
      onError: (err) => {
        console.error('Failed to submit sleep events', err);
      },
    });
  };

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

        <ThemedText type="default" style={styles.status}>
          {events.length} samples captured
        </ThemedText>

        <Pressable style={styles.stopButton} onPress={handleStop}>
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