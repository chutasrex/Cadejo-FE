import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Event {
  id: number;
  custom: boolean | null;
  name: string | null;
  description: string | null;
  created_at: string;
}

export interface EventCreate {
  custom: boolean;
  name: string;
  description?: string | null;
  by_user_id?: string | null;
}

export function useNightEvents(nightId?: number, enabled = true) {
  return useQuery({
    queryKey: ['night-events', nightId],
    queryFn: async () => {
      const res = await apiClient.get<Event[]>(`/user/nights/${nightId}/events`);
      console.log('RAW RESPONSE:', JSON.stringify(res, null, 2));
      return res;
    },
    enabled: enabled && nightId != null,
  });
}

export function useCustomerEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get<Event[]>('/user/events'),
  });
}

export function useAttachEventToNight(nightId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) =>
      apiClient.post(`/user/nights/${nightId}/events`, { event_id: eventId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-events', nightId] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventCreate) =>
      apiClient.post<Event>('/user/events', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}