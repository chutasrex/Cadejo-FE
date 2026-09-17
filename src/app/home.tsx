import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';

import { DateStrip } from '@/components/calendar';
import { ThemedView } from '@/components/themed-view';
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
import { useNights } from '@/hooks/use-night';
import { UserPreferencesModal } from '@/components/setting-user';
import {
  createUserPreferences,
  getCurrentUser,
} from '@/hooks/use-user';

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const { nightStatus, createNight } = useNights();

  const { error: userError } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });

  const createPreferences = useMutation({
    mutationFn: createUserPreferences,
    onSuccess: () => {
      setShowPreferencesModal(false);
    },
  });

  useEffect(() => {
    if (userError?.status === 404) {
      setShowPreferencesModal(true);
    }
  }, [userError]);

  const handleSelectDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    if (!nightStatus.has(dateKey)) {
      createNight.mutate(dateKey);
    }

    setSelectedDate(date);

    router.push({
      pathname: '/day-detailed',
      params: {
        date: dateKey,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <UserPreferencesModal
        visible={showPreferencesModal}
        onSubmit={createPreferences.mutate}
        isSubmitting={createPreferences.isPending}
        errorMessage={createPreferences.error?.message}
      />

      <SafeAreaView style={styles.safeArea}>
        <DateStrip
          selectedDate={selectedDate}
          nightStatus={nightStatus}
          onSelectDate={handleSelectDate}
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