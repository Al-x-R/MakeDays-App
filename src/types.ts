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
