import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Night,Sleep } from '@/types/sleep';

export function useNights() {
  const queryClient = useQueryClient();

  const query = useQuery<Night[]>({
    queryKey: ['nights'],
    queryFn: () => apiClient.get<Night[]>('/user/nights'),
  });

  const createNight = useMutation({
    mutationFn: (date: string) =>
      apiClient.post<Night>('/user/nights', {
        date,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['nights'],
      });
    },
  });

  const nightStatus = new Map(
    (query.data ?? []).map((night) => [night.date, night.empty]),
  );

  return {
    ...query,
    nightStatus,
    createNight,
  };
}

export function useSleep(
  nightId: number | undefined,
  enabled = true,
) {
  return useQuery<Sleep>({
    queryKey: ['sleep', nightId],
    queryFn: () =>
      apiClient.get<Sleep>(`/user/nights/${nightId}/sleep`),
    enabled: nightId !== undefined && enabled,
  });
}