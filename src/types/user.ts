export type UserPreferencesInput = {
  name: string;
  dob: Date | null;
  nocturne: boolean;
  idealHoursOfSleep: number | null;
};

export type User = {
  id: string;
  name: string;
  dob: Date | null;
  nocturne: boolean;
  idealHoursOfSleep: number | null;
  created_at: Date;
  updated_at: Date;
};