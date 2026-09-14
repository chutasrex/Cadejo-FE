import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Night } from '@/types/sleep';

export function useNights() {
  const query = useQuery<Night[]>({
    queryKey: ['nights'],
    queryFn: () => apiClient.get<Night[]>('/user/nights'),
  });

  console.log('NIGHTS DATA:', query.data);
  console.log(
    'NIGHT STATUS:',
    [...new Map(
      (query.data ?? []).map((night) => [night.date, night.empty])
    ).entries()]
  );

  const nightStatus = new Map(
    (query.data ?? []).map((night) => [night.date, night.empty]),
  );

  return {
    ...query,
    nightStatus,
  };
}