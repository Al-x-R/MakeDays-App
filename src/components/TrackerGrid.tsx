import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import {
  startOfWeek, endOfWeek, eachDayOfInterval, format, startOfDay, addWeeks, max, min
} from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import colors from '../constants/colors';
import { TrackerType } from '../types';

const GAP = 6;
const PADDING = 16;
const COLS = 7;

interface TrackerGridProps {
  type: TrackerType;
  isCountDown?: boolean;
  behavior?: 'DO' | 'QUIT';
  activeDates: string[];
  color: string;
  startDate: string | Date;
  endDate?: string | Date;
  onDayPress?: (date: Date) => void;
}

export const TrackerGrid = ({
  type, isCountDown, behavior, activeDates, color, startDate, endDate, onDayPress
}: TrackerGridProps) => {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();

  const activeGradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;
  const itemWidth = (width - (PADDING * 2) - (GAP * (COLS - 1))) / COLS;

  // --- ЛОГИКА РАСЧЕТА ДИАПАЗОНА ---
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(startDate));
    const end = endDate ? startOfDay(new Date(endDate)) : today;

    let rangeStart = start;
    let rangeEnd = end;

    if (type === 'HABIT') {
      // Обязательно захватываем "сегодня", даже если старт в будущем
      rangeStart = min([today, start]);
      // Рисуем минимум 4 недели (вперед от старта или сегодня)
      rangeEnd = max([today, addWeeks(start, 3)]);
    } else if (type === 'EVENT') {
      if (isCountDown) {
        rangeStart = min([today, start]);
        rangeEnd = max([today, end]);
      } else {
        rangeStart = start;
        rangeEnd = today;
      }
    }

    const gridStart = startOfWeek(rangeStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(rangeEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [type, isCountDown, startDate, endDate]);

  const todayIso = startOfDay(new Date()).toISOString();
  const actualStart = startOfDay(new Date(startDate));

  // --- ЛОГИКА РАСКРАСКИ ЯЧЕЕК ---
  const getCellProps = (day: Date) => {
    const dayIso = day.toISOString();
    const isToday = dayIso === todayIso;
    const isPast = day < startOfDay(new Date());

    const isBeforeStart = day < actualStart;
    const isStartDay = dayIso === actualStart.toISOString();

    if (type === 'HABIT') {
      const isActive = activeDates.includes(dayIso);

      // 1. Дни ДО старта (вообще не считаем, просто фон)
      if (isBeforeStart) {
        return {
          colors: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'],
          textColor: colors.text.dim,
          borderWidth: isToday ? 1 : 0,
          borderColor: isToday ? activeGradient[0] : 'transparent',
          opacity: 0.2 // Сильно тусклые
        };
      }

      // 2. Дни ПОСЛЕ старта (включая сам старт)
      if (behavior === 'QUIT') {
        if (isActive) {
          // Сорвался
          return { colors: colors.gradients.red, textColor: '#fff', opacity: 1, borderWidth: 0 };
        } else if (isPast || isToday) {
          // Держался
          return { colors: activeGradient, textColor: colors.text.inverse, opacity: isToday ? 1 : 0.6, borderWidth: 0 };
        }
      } else {
        if (isActive) {
          // Выполнил DO
          return { colors: activeGradient, textColor: colors.text.inverse, opacity: 1, borderWidth: 0 };
        }
      }

      // 3. Пустые/Будущие дни (или пропущенные DO)
      return {
        colors: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'],
        textColor: colors.text.dim,
        // Рамка для "Сегодня" или "Дня старта"
        borderWidth: isStartDay || isToday ? 1 : 0,
        borderColor: isStartDay ? activeGradient[1] : (isToday ? activeGradient[0] : 'transparent'),
        opacity: isStartDay || isToday ? 1 : 0.4
      };
    }

    // --- ДЛЯ СОБЫТИЙ ---
    if (type === 'EVENT') {
      const end = endDate ? startOfDay(new Date(endDate)) : todayIso;
      const current = startOfDay(day);

      const isTargetDay = dayIso === startOfDay(new Date(isCountDown ? end : startDate)).toISOString();
      let isWithinTarget = isCountDown
        ? (current >= startOfDay(new Date()) && current <= startOfDay(new Date(end)))
        : (current >= actualStart && current <= startOfDay(new Date()));

      if (isWithinTarget) {
        return {
          colors: activeGradient,
          textColor: colors.text.inverse,
          opacity: (isCountDown && isPast) ? 0.3 : (isPast ? 0.6 : 1),
          borderWidth: 0
        };
      }

      return {
        colors: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'],
        textColor: colors.text.dim,
        borderWidth: isTargetDay || isToday ? 1 : 0,
        borderColor: isTargetDay ? activeGradient[1] : (isToday ? activeGradient[0] : 'transparent'),
        opacity: isTargetDay || isToday ? 0.8 : 0.2
      };
    }

    return { colors: ['transparent', 'transparent'], textColor: 'transparent', borderWidth: 0, borderColor: 'transparent', opacity: 0 };
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
          const props = getCellProps(day);
          const isFirstOfMonth = day.getDate() === 1;

          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => onDayPress?.(day)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={props.colors as unknown as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.cell,
                  {
                    width: itemWidth,
                    height: itemWidth,
                    borderWidth: props.borderWidth,
                    borderColor: props.borderColor,
                    opacity: props.opacity,
                  },
                ]}
              >
                <Text style={[styles.cellText, { color: props.textColor, fontSize: itemWidth * 0.35 }]}>
                  {format(day, 'd')}
                </Text>

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', gap: GAP, marginBottom: GAP * 1.5, paddingHorizontal: PADDING },
  weekDayText: { color: colors.text.secondary, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingBottom: 20, paddingHorizontal: PADDING },
  cell: { borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cellText: { fontWeight: '700' },
  monthBadge: { position: 'absolute', bottom: -14 },
  monthText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', opacity: 0.6, color: colors.text.dim },
});
