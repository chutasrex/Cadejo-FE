import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Night } from '@/types/sleep';

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useNightByDate(date: Date) {
  const dateParam = formatDateParam(date);

  return useQuery({
    queryKey: ['night', dateParam],
    queryFn: () => apiClient.get<Night>(`/nights?date=${dateParam}`),
  });
}