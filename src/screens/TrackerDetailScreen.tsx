import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Edit2, Trash2, TrendingUp, Calendar, CheckCircle, Clock, Ban, Flame } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { differenceInCalendarDays, startOfDay, subDays, format } from 'date-fns';

import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';
import { YearGrid } from '../components/YearGrid';
import { TrackerGrid } from '../components/TrackerGrid';

export const TrackerDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const id = route.params?.id;
  const tracker = useTrackerStore((state) => state.trackers.find((t) => t.id === id));
  const deleteTracker = useTrackerStore((state) => state.deleteTracker);

  useEffect(() => {
    if (!tracker) {
      navigation.goBack();
    }
  }, [tracker, navigation]);

  if (!tracker) {
    return null;
  }

  const gradient = colors.gradients[tracker.color as keyof typeof colors.gradients] || colors.gradients.today;

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(tracker.startDate || tracker.createdAt));
    const end = tracker.endDate ? startOfDay(new Date(tracker.endDate)) : today;
    const history = tracker.history || {};

    if (tracker.type === 'EVENT') {
      const totalDays = Math.max(1, Math.abs(differenceInCalendarDays(end, start)));
      const passed = differenceInCalendarDays(today, start);
      const left = differenceInCalendarDays(end, today);

      let percentage = Math.round((passed / totalDays) * 100);
      if (percentage > 100) percentage = 100;
      if (percentage < 0) percentage = 0;

      return {
        mainValue: tracker.isCountDown ? Math.max(0, left) : Math.max(0, passed),
        mainLabel: tracker.isCountDown ? t('detail.daysLeft', 'Осталось дней') : t('detail.daysPassed', 'Прошло дней'),
        subText: `${percentage}% ${t('detail.completed', 'Завершено')}`,
        small1Value: totalDays,
        small1Label: t('detail.targetDays', 'Цель (дней)'),
        small1Icon: Calendar,
        small2Value: format(end, 'dd.MM.yyyy'),
        small2Label: tracker.isCountDown ? t('detail.targetDate', 'Конечная дата') : t('detail.eventDate', 'Дата события'),
        small2Icon: Clock,
        MainIcon: Clock
      };
    }

    if (tracker.behavior === 'QUIT') {
      const lastReset = startOfDay(new Date(tracker.lastResetDate || start));
      const currentStreak = Math.max(0, differenceInCalendarDays(today, lastReset));
      const totalDays = Math.max(0, differenceInCalendarDays(today, start));

      return {
        mainValue: currentStreak,
        mainLabel: t('card.daysWithoutIt', 'Дней без срывов'),
        subText: t('detail.sinceLastReset', 'С последнего сброса'),
        small1Value: totalDays,
        small1Label: t('detail.totalDays', 'Всего дней'),
        small1Icon: Calendar,
        small2Value: tracker.goal?.enabled && tracker.goal.targetValue ? tracker.goal.targetValue : '∞',
        small2Label: t('card.goal', 'Цель').replace(':', ''),
        small2Icon: Flame,
        MainIcon: Ban
      };
    }

    // 3. HABIT: DO (Создать привычку)
    const totalDays = Math.max(1, differenceInCalendarDays(today, start) + 1);
    const historyDates = Object.keys(history).filter(k => history[k]);
    const completed = historyDates.length;
    const percentage = Math.round((completed / totalDays) * 100);

    // Считаем текущий стрик
    let currentStreak = 0;
    let checkDate = today;
    if (!history[checkDate.toISOString()] && history[subDays(checkDate, 1).toISOString()]) {
      checkDate = subDays(checkDate, 1);
    }
    while (history[checkDate.toISOString()]) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }

    return {
      mainValue: `${percentage}%`,
      mainLabel: t('detail.successRate', 'Успешность'),
      subText: t('detail.checkInsOutOf', {
        completed,
        total: totalDays,
        defaultValue: `${completed} отметок из ${totalDays} дней`
      }),
      small1Value: completed,
      small1Label: t('detail.totalCheckIns', 'Всего отметок'),
      small1Icon: Calendar,
      small2Value: currentStreak,
      small2Label: t('detail.currentStreak', 'Текущая серия'),
      small2Icon: CheckCircle,
      MainIcon: TrendingUp
    };
  }, [tracker, t]);

  const handleDelete = () => {
    Alert.alert(
      t('detail.delete', 'Удалить'),
      t('detail.deleteConfirm', 'Вы уверены?'),
      [
        { text: t('common.cancel', 'Отмена'), style: 'cancel' },
        {
          text: t('common.delete', 'Удалить'),
          style: 'destructive',
          onPress: () => {
            deleteTracker(tracker.id);
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert(t('detail.edit', 'Изменить'), t('detail.editMessage', 'Редактировать трекер'));
  };
  console.log('tracker =>', tracker);
  const activeDates = Object.keys(tracker.history || {}).filter(k => tracker.history[k]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ХЕДЕР */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{tracker.title}</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <Edit2 color={colors.text.secondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Trash2 color={colors.gradients.red[0]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* БЛОК СТАТИСТИКИ */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[`${gradient[0]}15`, `${gradient[0]}05`]}
            style={[styles.mainStatCard, { borderColor: `${gradient[0]}40` }]}
          >
            <View style={styles.statHeader}>
              <stats.MainIcon size={16} color={gradient[0]} />
              <Text style={[styles.statLabel, { color: gradient[0] }]}>{stats.mainLabel}</Text>
            </View>
            <Text style={styles.mainStatValue}>{stats.mainValue}</Text>
            <Text style={styles.statSub}>{stats.subText}</Text>
          </LinearGradient>

          <View style={styles.row}>
            <View style={styles.smallStatCard}>
              <stats.small1Icon size={16} color={colors.text.dim} />
              <Text style={styles.smallStatValue}>{stats.small1Value}</Text>
              <Text style={styles.smallStatLabel} numberOfLines={1}>{stats.small1Label}</Text>
            </View>
            <View style={styles.smallStatCard}>
              <stats.small2Icon size={16} color={gradient[1]} />
              <Text style={[styles.smallStatValue, { color: gradient[1] }]}>
                {stats.small2Value}
              </Text>
              <Text style={styles.smallStatLabel} numberOfLines={1}>{stats.small2Label}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('detail.activityHistory', 'История активности')}</Text>

        {/* СЕТКА АКТИВНОСТИ */}
        <View style={styles.gridContainer}>
          <TrackerGrid
            type={tracker.type}
            isCountDown={tracker.isCountDown}
            behavior={tracker.behavior}
            activeDates={activeDates}
            color={tracker.color || 'today'}
            startDate={tracker.startDate || tracker.createdAt}
            endDate={tracker.endDate}
            onDayPress={(date) => Alert.alert(t('calendar.dateAlertTitle', 'Дата'), format(date, 'dd MMMM yyyy'))}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Стили остались без изменений
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders.past,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  actions: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 4 },
  scrollContent: { paddingBottom: 40 },
  statsContainer: { padding: 16, gap: 12 },
  mainStatCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  mainStatValue: { color: colors.text.primary, fontSize: 48, fontWeight: '800', marginVertical: 4 },
  statSub: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  smallStatCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borders.past,
  },
  smallStatValue: { color: colors.text.primary, fontSize: 24, fontWeight: '700', marginVertical: 6 },
  smallStatLabel: { color: colors.text.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gridContainer: {
    height: 400,
    paddingHorizontal: 16,
  }
});
