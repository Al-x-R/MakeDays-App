import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import {
  startOfWeek, endOfWeek, eachDayOfInterval, format, startOfDay, addDays, max, min, isSameDay
} from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Flag, Trophy } from 'lucide-react-native';
import colors from '../constants/colors';
import { TrackerType } from '../types';

const GAP = 6;
const PADDING = 16;
const COLS = 7;

interface TrackerGridProps {
  type: TrackerType;
  isCountDown?: boolean;
  behavior?: 'DO' | 'QUIT';
  targetDays?: number;
  goalEnabled?: boolean;
  activeDates: string[];
  color: string;
  startDate: string | Date;
  endDate?: string | Date;
  onDayPress?: (date: Date) => void;
}

export const TrackerGrid = ({
  type, behavior, targetDays, goalEnabled, activeDates, color, startDate, endDate, onDayPress
}: TrackerGridProps) => {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();

  const activeGradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;
  const itemWidth = (width - (PADDING * 2) - (GAP * (COLS - 1))) / COLS;

  const actualStart = startOfDay(new Date(startDate));
  const today = startOfDay(new Date());

  const goalEndDate = useMemo(() => {
    if (type === 'HABIT' && goalEnabled && targetDays && targetDays > 0) {
      return addDays(actualStart, targetDays - 1);
    }
    return null;
  }, [type, goalEnabled, targetDays, actualStart]);

  const days = useMemo(() => {
    let rangeStart = min([today, actualStart]);
    let rangeEnd = today;

    if (type === 'HABIT') {
      let defaultEnd = endDate ? startOfDay(new Date(endDate)) : today;
      if (goalEndDate) {
        defaultEnd = max([defaultEnd, goalEndDate]);
      }
      rangeEnd = max([defaultEnd, addWeeks(today, 2), addWeeks(actualStart, 3)]);
    } else if (type === 'EVENT') {
      if (endDate) {
        const targetEnd = startOfDay(new Date(endDate));
        rangeEnd = max([today, targetEnd, addWeeks(targetEnd, 1)]);
      } else {
        rangeEnd = max([today, addWeeks(today, 2)]);
      }
    }

    const gridStart = startOfWeek(rangeStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(rangeEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [type, startDate, endDate, goalEndDate]);

  const todayIso = today.toISOString();

  const emptyCellBase = {
    colors: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'],
    textColor: colors.text.dim,
  };

  const getCellProps = (day: Date) => {
    const dayIso = day.toISOString();
    const isToday = dayIso === todayIso;
    const isPast = day < today;
    const isStartDay = isSameDay(day, actualStart);

    if (type === 'HABIT') {
      const isBeforeStart = day < actualStart;
      const isGoalPath = goalEndDate && day >= actualStart && day <= goalEndDate;
      const isFinishDay = goalEndDate && isSameDay(day, goalEndDate);
      const isActive = activeDates.includes(dayIso);

      if (isBeforeStart) {
        return {
          ...emptyCellBase,
          borderWidth: isToday ? 1 : 0,
          borderColor: isToday ? activeGradient[0] : 'transparent',
          opacity: 0.3
        };
      }

      let borderW = 0;
      let borderC = 'transparent';
      let op = isToday ? 1 : 0.4;

      if (isFinishDay) {
        borderW = 2; borderC = activeGradient[0]; op = 1;
      } else if (isGoalPath) {
        borderW = 1; borderC = activeGradient[0];
        if (!isPast) op = 0.6;
      } else if (isToday) {
        borderW = 1; borderC = 'rgba(255,255,255,0.2)';
      }

      if (behavior === 'QUIT') {
        if (isActive) {
          return { colors: colors.gradients.red, textColor: '#fff', opacity: 1, borderWidth: borderW, borderColor: borderC, isFinish: isFinishDay };
        } else if (isPast || isToday) {
          return { colors: activeGradient, textColor: colors.text.inverse, opacity: isToday ? 1 : 0.7, borderWidth: borderW, borderColor: borderC, isFinish: isFinishDay };
        }
      } else {
        if (isActive) {
          return { colors: activeGradient, textColor: colors.text.inverse, opacity: 1, borderWidth: borderW, borderColor: borderC, isFinish: isFinishDay };
        }
      }

      return {
        ...emptyCellBase,
        textColor: isFinishDay ? activeGradient[0] : colors.text.dim,
        borderWidth: borderW, borderColor: borderC, opacity: op, isFinish: isFinishDay
      };
    }

    if (type === 'EVENT') {
      const eventEnd = endDate ? startOfDay(new Date(endDate)) : today;
      const isTargetDay = endDate ? isSameDay(day, eventEnd) : isSameDay(day, actualStart);

      const isEventPath = day >= actualStart && day <= eventEnd;

      if (isEventPath) {
        let borderW = 1;
        let borderC = `${activeGradient[0]}80`;
        let op = 1;
        let isFilled = false;

        if (isTargetDay) {
          borderW = 2; borderC = activeGradient[0]; op = 1;
        } else if (isToday) {
          borderW = 1; borderC = 'rgba(255,255,255,0.4)';
        }

        if (day <= today) {
          isFilled = true;
          op = isToday ? 1 : 0.6;
        } else {
          isFilled = false;
          op = 0.6;
        }

        if (isFilled) {
          return {
            colors: activeGradient, textColor: colors.text.inverse,
            opacity: op, borderWidth: borderW, borderColor: borderC, isEventTarget: isTargetDay
          };
        } else {
          return {
            ...emptyCellBase,
            textColor: isTargetDay ? activeGradient[0] : colors.text.dim,
            borderWidth: borderW, borderColor: borderC, opacity: op, isEventTarget: isTargetDay
          };
        }
      }

      return {
        ...emptyCellBase,
        borderWidth: isToday ? 1 : 0,
        borderColor: isToday ? activeGradient[0] : 'transparent',
        opacity: 0.3, isEventTarget: false
      };
    }

    return { ...emptyCellBase, borderWidth: 0, borderColor: 'transparent', opacity: 0.1 };
  };

  const locale = i18n.language === 'ru' ? ru : enUS;
  const weekDays = (t('calendar.weekdays', { returnObjects: true }) || ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]) as string[];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {Array.isArray(weekDays) && weekDays.map((d, i) => (
          <Text key={i} style={[styles.weekDayText, { width: itemWidth }]}>{d}</Text>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {days.map((day) => {
          const cellProps = getCellProps(day);
          const isFirstOfMonth = day.getDate() === 1;

          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => onDayPress?.(day)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={cellProps.colors as unknown as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.cell,
                  {
                    width: itemWidth,
                    height: itemWidth / 1.5,
                    borderWidth: cellProps.borderWidth,
                    borderColor: cellProps.borderColor,
                    opacity: cellProps.opacity,
                  },
                ]}
              >
                {cellProps.isFinish ? (
                  <Trophy size={itemWidth * 0.4} color={cellProps.colors[0] === 'rgba(255,255,255,0.06)' ? activeGradient[0] : '#fff'} />
                ) : cellProps.isEventTarget ? (
                  <Flag size={itemWidth * 0.4} color={cellProps.textColor} />
                ) : (
                  <Text style={[styles.cellText, { color: cellProps.textColor, fontSize: itemWidth * 0.35 }]}>
                    {format(day, 'd')}
                  </Text>
                )}

                {isFirstOfMonth && (
                  <View style={styles.monthBadge}>
                    <Text style={styles.monthText}>
                      {format(day, 'MMM', { locale })}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', gap: GAP, marginBottom: GAP * 1.5, paddingHorizontal: PADDING },
  weekDayText: { color: colors.text.secondary, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingBottom: 20, paddingHorizontal: PADDING },
  cell: { borderRadius: 10, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cellText: { fontWeight: '700' },
  monthBadge: { position: 'absolute', bottom: -13, backgroundColor: colors.background, paddingHorizontal: 2, borderRadius: 4 },
  monthText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', color: colors.text.dim, letterSpacing: 0.5 },
});
