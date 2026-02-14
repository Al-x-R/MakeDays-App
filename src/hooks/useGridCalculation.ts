import { useMemo } from 'react';
import {
  eachMonthOfInterval,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  isBefore,
  isSameDay,
  startOfDay,
  getDayOfYear,
  getDaysInYear,
  getDay,
  format
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { MonthData, DayData, DayStatus } from '../types';

export const useGridCalculation = (year: number = new Date().getFullYear()) => {

  const months: MonthData[] = useMemo(() => {
    const now = startOfDay(new Date());
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const totalDaysInYear = getDaysInYear(yearStart);

    const rawMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return rawMonths.map((monthDate) => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const rawDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const formattedDays: DayData[] = rawDays.map((date) => {
        let status: DayStatus = 'FUTURE';
        if (isSameDay(date, now)) status = 'TODAY';
        else if (isBefore(date, now)) status = 'PAST';

        let dayOfWeek = getDay(date);
        if (dayOfWeek === 0) dayOfWeek = 7;

        return {
          id: date.toISOString(),
          date,
          status,
          dayNumber: getDayOfYear(date),
          progress: parseFloat(((getDayOfYear(date) / totalDaysInYear) * 100).toFixed(1)),
          dayOfWeek,
          dayOfMonth: date.getDate()
        };
      });

      const firstDayOfMonth = formattedDays[0];
      const emptySlotsCount = firstDayOfMonth.dayOfWeek - 1;

      const emptySlots: DayData[] = Array.from({ length: emptySlotsCount }).map((_, index) => ({
        id: `empty-${monthDate.getMonth()}-${index}`,
        date: null,
        status: 'EMPTY',
        dayNumber: 0,
        progress: 0,
        dayOfWeek: index + 1,
        dayOfMonth: 0
      }));

      return {
        id: monthDate.toISOString(),
        name: format(monthDate, 'LLLL', { locale: ru }),
        days: [...emptySlots, ...formattedDays]
      };
    });

  }, [year]);

  return months;
};
