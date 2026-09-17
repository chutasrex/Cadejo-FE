export enum QualityOfSleep {
  POOR = 'POOR',
  MID = 'MID',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
}

export enum SleepStage {
  AWAKE = 'AWAKE',
  LIGHT_SLEEP = 'LIGHT_SLEEP',
  DEEP_SLEEP = 'DEEP_SLEEP',
  REM = 'REM',
}

export interface SleepSegment {
  sleep_id: number;
  idx: number | null;
  sleep_stage: SleepStage | null;
  duration: number | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface Sleep {
  id: number;
  night_id: number | null;
  duration: number | null; 
  PSQI: number | null;
  quality_of_sleep: QualityOfSleep | null;
  created_at: string;
  sleep_segments: SleepSegment[];
}

export interface Night {
  id: number;
  user_id: string | null;
  date: string; // YYYY-MM-DD
  created_at: string;
  empty: boolean
  sleep: Sleep | null;
}

export interface SleepEvent {
  idx: number;
  x: number;
  y:number;
  z:number;
  timestamp: string;
}