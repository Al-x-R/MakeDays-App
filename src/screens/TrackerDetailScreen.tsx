import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { differenceInCalendarDays, startOfDay, eachDayOfInterval, format } from 'date-fns';
import * as Icons from 'lucide-react-native';

import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';
import { TrackerGrid } from '../components/TrackerGrid';

export const TrackerDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const id = route.params?.id;

  const tracker = useTrackerStore((state) => state.trackers.find((t) => t.id === id));
  const deleteTracker = useTrackerStore((state) => state.deleteTracker);

  useEffect(() => {
    if (!tracker) navigation.goBack();
  }, [tracker, navigation]);

  if (!tracker) return null;

  const gradient = colors.gradients[tracker.color as keyof typeof colors.gradients] || colors.gradients.today;
  const IconComponent = (Icons as any)[tracker.icon || 'Activity'] || Icons.Activity;

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(tracker.startDate || tracker.createdAt));
    const end = tracker.endDate ? startOfDay(new Date(tracker.endDate)) : null;
    const history = tracker.history || {};

    const daysToStart = differenceInCalendarDays(start, today);
    let status: 'PENDING' | 'ACTIVE' | 'COMPLETED' = 'ACTIVE';

    if (daysToStart > 0) status = 'PENDING';
    else if (end && today > end && tracker.type !== 'HABIT') status = 'COMPLETED';

    const statusText = status === 'PENDING' ? t('detail.statusPending', 'Ожидание') :
      status === 'COMPLETED' ? t('detail.statusCompleted', 'Завершено') :
        t('detail.statusActive', 'Активно');

    let mainValue: string | number = 0;
    let mainLabel = '';
    const subStats: { label: string; value: string | number }[] = [];

    const daysSinceStart = eachDayOfInterval({ start, end: today });

    if (status === 'PENDING') {
      mainValue = daysToStart;
      mainLabel = t('detail.daysUntilStart', 'Дней до старта');
      subStats.push({ label: t('create.startDate', 'Старт'), value: format(start, 'dd.MM.yyyy') });
      subStats.push({ label: t('create.typeAndMode', 'Тип'), value: tracker.type === 'EVENT' ? 'EVENT' : tracker.behavior || 'DO' });
    }
    else if (tracker.type === 'EVENT') {
      const targetDate = end || today;
      const totalDays = Math.max(1, Math.abs(differenceInCalendarDays(targetDate, start)));
      const passed = differenceInCalendarDays(today, start);
      const left = differenceInCalendarDays(targetDate, today);
      const percentage = Math.max(0, Math.min(100, Math.round((passed / totalDays) * 100)));

      mainValue = tracker.isCountDown ? Math.max(0, left) : Math.max(0, passed);
      mainLabel = tracker.isCountDown ? t('detail.daysLeft', 'Осталось дней') : t('detail.daysPassed', 'Прошло дней');

      subStats.push({ label: t('detail.targetDays', 'Всего дней'), value: totalDays });
      subStats.push({ label: tracker.isCountDown ? t('detail.targetDate', 'Конец') : t('detail.eventDate', 'Дата'), value: format(targetDate, 'dd.MM.yy') });
      subStats.push({ label: t('detail.successRate', 'Прогресс'), value: `${percentage}%` });
    }
    else if (tracker.behavior === 'QUIT') {
      let currentCleanStreak = 0;
      let bestCleanStreak = 0;
      daysSinceStart.forEach(d => {
        if (!history[d.toISOString()]) {
          currentCleanStreak++;
          bestCleanStreak = Math.max(bestCleanStreak, currentCleanStreak);
        } else currentCleanStreak = 0;
      });

      mainValue = currentCleanStreak;
      mainLabel = t('detail.daysClean', 'Дней без срывов подряд');
      subStats.push({ label: t('detail.bestStreak', 'Рекорд'), value: bestCleanStreak });
      subStats.push({ label: t('detail.totalDays', 'Всего дней'), value: Math.max(1, daysSinceStart.length) });
      subStats.push({ label: t('card.goal', 'Цель').replace(':', ''), value: tracker.goal?.enabled && tracker.goal.targetValue ? tracker.goal.targetValue : '∞' });
    }
    else { // HABIT: DO
      let currentStreak = 0;
      let bestStreak = 0;
      let completedCount = 0;
      daysSinceStart.forEach(d => {
        if (history[d.toISOString()]) {
          completedCount++;
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else currentStreak = 0;
      });

      const totalDays = Math.max(1, daysSinceStart.length);
      const percentage = Math.round((completedCount / totalDays) * 100);

      mainValue = currentStreak;
      mainLabel = t('detail.currentStreak', 'Дней подряд');
      subStats.push({ label: t('detail.bestStreak', 'Рекорд'), value: bestStreak });
      subStats.push({ label: t('detail.successRate', 'Успешность'), value: `${percentage}%` });
      subStats.push({ label: t('detail.totalCheckIns', 'Отметок'), value: completedCount });
    }

    return { status, statusText, mainValue, mainLabel, subStats };
  }, [tracker, t]);

  const handleDelete = () => {
    Alert.alert(t('detail.delete', 'Удалить'), t('detail.deleteConfirm', 'Вы уверены?'), [
      { text: t('common.cancel', 'Отмена'), style: 'cancel' },
      { text: t('common.delete', 'Удалить'), style: 'destructive', onPress: () => { deleteTracker(tracker.id); } }
    ]);
  };

  const statusColor = stats.status === 'PENDING' ? colors.gradients.orange[0] :
    stats.status === 'COMPLETED' ? colors.gradients.green[0] :
      gradient[0];

  const activeDates = Object.keys(tracker.history || {}).filter(k => tracker.history[k]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => Alert.alert('Edit', 'Скоро')} style={styles.iconButton}>
            <Edit2 color={colors.text.secondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Trash2 color={colors.gradients.red[0]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={[`${gradient[0]}20`, `${gradient[0]}05`]}
          style={[styles.dashboardCard, { borderColor: `${gradient[0]}40` }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: `${gradient[0]}30` }]}>
              <IconComponent size={24} color={gradient[0]} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.trackerTitle} numberOfLines={1}>{tracker.title}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{stats.statusText}</Text>
              </View>
            </View>
          </View>

          {tracker.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>{tracker.description}</Text>
          ) : null}

          <View style={styles.mainStatArea}>
            <Text style={styles.mainStatValue}>{stats.mainValue}</Text>
            <Text style={[styles.mainStatLabel, { color: gradient[0] }]}>{stats.mainLabel}</Text>
          </View>

          <View style={styles.subStatsGrid}>
            {stats.subStats.map((stat, idx) => (
              <View key={idx} style={styles.subStatItem}>
                <Text style={styles.subStatValue} numberOfLines={1}>{stat.value}</Text>
                <Text style={styles.subStatLabel} numberOfLines={1}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>{t('detail.activityHistory', 'История активности')}</Text>
        <View style={styles.gridContainer}>
          <TrackerGrid
            type={tracker.type}
            isCountDown={tracker.isCountDown}
            behavior={tracker.behavior}
            activeDates={activeDates}
            color={tracker.color || 'today'}
            startDate={tracker.startDate || tracker.createdAt}
            endDate={tracker.endDate}
            onDayPress={(date) => Alert.alert('Дата', format(date, 'dd MMMM yyyy'))}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 4 },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  // DASHBOARD CARD
  dashboardCard: { marginHorizontal: 16, padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1 },
  trackerTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  descriptionText: { color: colors.text.secondary, fontSize: 14, lineHeight: 20, marginBottom: 16, opacity: 0.8 },

  mainStatArea: { alignItems: 'center', paddingVertical: 12, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  mainStatValue: { color: colors.text.primary, fontSize: 64, fontWeight: '900', lineHeight: 70 },
  mainStatLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  subStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  subStatItem: { flex: 1, minWidth: '30%', backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center' },
  subStatValue: { color: colors.text.primary, fontSize: 18, fontWeight: '800', marginBottom: 2 },
  subStatLabel: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionTitle: { paddingHorizontal: 20, marginBottom: 16, color: colors.text.secondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  gridContainer: { paddingHorizontal: 16 }
});
