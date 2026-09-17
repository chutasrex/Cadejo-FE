import { apiClient } from '@/lib/api-client';
import { UserPreferencesInput, User } from '@/types/user';

export async function getCurrentUser(){
    return apiClient.get<User>('/user/')
}

export async function createUserPreferences(
  values: UserPreferencesInput
) {
  return apiClient.post<User>('/user/', values);
}