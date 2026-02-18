// src/types.ts
export type DayStatus = 'PAST' | 'TODAY' | 'FUTURE' | 'EMPTY';

export interface DayData {
  id: string;
  date: Date | null;
  status: DayStatus | 'EMPTY';
  dayNumber: number;
  progress: number;
  dayOfWeek: number;
  dayOfMonth: number;
}

export interface MonthData {
  id: string;
  name: string;
  days: DayData[];
}

export type TrackerType = 'HABIT' | 'EVENT';

export interface Tracker {
  id: string;
  title: string;
  type: TrackerType;
  color?: string;
  history: Record<string, boolean>;
  createdAt: string;

  endDate?: string;
  isCountDown?: boolean;
  behavior?: 'DO' | 'QUIT';

  goal?: {
    enabled: boolean;
    targetValue?: number;
  };
  lastResetDate?: string;
}
