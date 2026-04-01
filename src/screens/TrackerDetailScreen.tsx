// src/screens/TrackerDetailScreen.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Edit2, Trash2, CheckCircle, MoreVertical, RotateCcw } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { differenceInCalendarDays, startOfDay, eachDayOfInterval, format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as Icons from 'lucide-react-native';

import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';
import { TrackerGrid } from '../components/TrackerGrid';
import { ActionModal } from '../components/ActionModal';

export const TrackerDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id;

  const tracker = useTrackerStore((state) => state.trackers.find((t) => t.id === id));
  const deleteTracker = useTrackerStore((state) => state.deleteTracker);
  const toggleDay = useTrackerStore((state) => state.toggleDay);
  const finishTracker = useTrackerStore((state) => state.finishTracker);
  const recordRelapse = useTrackerStore((state) => state.recordRelapse);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  const gradient = tracker ? (colors.gradients[tracker.color as keyof typeof colors.gradients] || colors.gradients.today) : colors.gradients.today;
  const IconComponent = tracker ? ((Icons as any)[tracker.icon || 'Activity'] || Icons.Activity) : Icons.Activity;

  const start = tracker ? startOfDay(new Date(tracker.startDate || tracker.createdAt)) : startOfDay(new Date());
  const end = tracker?.endDate ? startOfDay(new Date(tracker.endDate)) : null;
  const history = tracker?.history || {};
  const activeDates = Object.keys(history).filter(k => history[k]);

  const stats = useMemo(() => {
    if (!tracker) return { status: 'ACTIVE' as const, statusText: '', mainValue: 0, mainLabel: '', subStats: [], bestCleanStreak: 0, hasRelapses: false };

    const today = startOfDay(new Date());
    const daysToStart = differenceInCalendarDays(start, today);
    let status: 'PENDING' | 'ACTIVE' | 'COMPLETED' = 'ACTIVE';

    if (daysToStart > 0) status = 'PENDING';
    else if (end && today >= end) status = 'COMPLETED';

    const statusText = status === 'PENDING'
      ? t('detail.statusPending')
      : status === 'COMPLETED'
        ? t('detail.statusCompleted')
        : t('detail.statusActive');

    // ФИКС ВРЕМЕНИ: Если трекер завершен, мы останавливаем счетчик на дате окончания
    const activeDate = (status === 'COMPLETED' && end) ? end : today;
    const daysSinceStart = eachDayOfInterval({ start, end: activeDate });

    let mainValue: string | number = 0;
    let mainLabel = '';
    const subStats: { label: string; value: string | number }[] = [];

    let bestCleanStreak = 0;
    let hasRelapses = false;

    if (status === 'PENDING') {
      mainValue = daysToStart;
      mainLabel = t('detail.daysUntilStart');
      subStats.push({ label: t('create.startDate'), value: format(start, 'dd.MM.yyyy') });
      subStats.push({ label: t('create.typeAndMode'), value: tracker.type === 'EVENT' ? 'EVENT' : (tracker.behavior || 'DO') });
    }
    else if (tracker.type === 'EVENT') {
      const targetDate = end || today;
      const totalDays = Math.max(1, Math.abs(differenceInCalendarDays(targetDate, start)));
      // Используем activeDate вместо today, чтобы заморозить прогресс
      const passed = differenceInCalendarDays(activeDate, start);
      const left = differenceInCalendarDays(targetDate, activeDate);
      const percentage = Math.max(0, Math.min(100, Math.round((passed / totalDays) * 100)));

      mainValue = tracker.isCountDown ? Math.max(0, left) : Math.max(0, passed);
      mainLabel = tracker.isCountDown ? t('detail.daysLeft') : t('detail.daysPassed');

      subStats.push({ label: t('detail.targetDays'), value: totalDays });
      subStats.push({ label: tracker.isCountDown ? t('detail.targetDate') : t('detail.eventDate'), value: format(targetDate, 'dd.MM.yy') });
      subStats.push({ label: t('detail.successRate'), value: `${percentage}%` });
    }
    else if (tracker.behavior === 'QUIT') {
      let currentCleanStreak = 0;

      daysSinceStart.forEach(d => {
        if (!history[d.toISOString()]) {
          currentCleanStreak++;
          bestCleanStreak = Math.max(bestCleanStreak, currentCleanStreak);
        } else {
          currentCleanStreak = 0;
          hasRelapses = true;
        }
      });

      const totalPassed = Math.max(1, daysSinceStart.length);
      const targetValue = tracker.goal?.targetValue;
      const isGoalEnabled = tracker.goal?.enabled;

      mainValue = currentCleanStreak;
      mainLabel = t('detail.daysClean', 'Текущая серия');

      subStats.push({ label: t('card.goal', 'Цель').replace(':', '').trim(), value: isGoalEnabled && targetValue ? targetValue : t('common.infinitySymbol', '∞') });
      subStats.push({ label: t('detail.daysPassed', 'Прошло'), value: totalPassed });

      if (isGoalEnabled && targetValue) {
        const left = Math.max(0, targetValue - currentCleanStreak);
        subStats.push({ label: t('detail.daysLeft', 'Осталось'), value: left });
      } else {
        subStats.push({ label: t('detail.daysLeft', 'Осталось'), value: t('common.infinitySymbol', '∞') });
      }
    }
    else { // HABIT: DO
      let completedCount = 0;

      daysSinceStart.forEach(d => {
        if (history[d.toISOString()]) {
          completedCount++;
        }
      });

      const totalPassed = Math.max(1, daysSinceStart.length);
      const targetValue = tracker.goal?.targetValue;
      const isGoalEnabled = tracker.goal?.enabled;

      mainValue = completedCount;
      mainLabel = t('detail.totalCheckIns', 'Отметок');

      subStats.push({ label: t('card.goal', 'Цель').replace(':', '').trim(), value: isGoalEnabled && targetValue ? targetValue : t('common.infinitySymbol', '∞') });
      subStats.push({ label: t('detail.daysPassed', 'Прошло'), value: totalPassed });

      if (isGoalEnabled && targetValue) {
        const left = Math.max(0, targetValue - completedCount);
        subStats.push({ label: t('detail.daysLeft', 'Осталось'), value: left });
      } else {
        subStats.push({ label: t('detail.daysLeft', 'Осталось'), value: t('common.infinitySymbol', '∞') });
      }
    }

    return { status, statusText, mainValue, mainLabel, subStats, bestCleanStreak, hasRelapses };
  }, [tracker, t, start, end, history]);

  useEffect(() => {
    if (!tracker) navigation.goBack();
  }, [tracker, navigation]);

  const handleEdit = () => {
    if (!tracker) return;
    setIsMenuVisible(false);
    navigation.navigate('EditTracker', { id: tracker.id });
  };

  const handleFinish = () => {
    if (!tracker) return;
    setIsMenuVisible(false);

    setModalConfig({
      visible: true,
      title: t('detail.finishTitle'),
      message: t('detail.finishMessage'),
      confirmText: t('detail.finishConfirm'),
      onConfirm: () => {
        finishTracker(tracker.id);
        setModalConfig(prev => ({ ...prev, visible: false }));
      }
    });
  };

  const handleDelete = () => {
    if (!tracker) return;
    setIsMenuVisible(false);

    setModalConfig({
      visible: true,
      title: t('detail.delete'),
      message: t('detail.deleteConfirm'),
      confirmText: t('common.delete'),
      onConfirm: () => {
        deleteTracker(tracker.id);
        setModalConfig(prev => ({ ...prev, visible: false }));
      }
    });
  };

  const handleRelapse = () => {
    if (!tracker) return;
    setIsMenuVisible(false);

    const targetDays = tracker.goal?.enabled ? tracker.goal.targetValue : undefined;

    setModalConfig({
      visible: true,
      title: t('detail.relapseTitle'),
      message: targetDays
        ? t('detail.relapseMessageWithTarget', { targetDays, finish: t('detail.finishConfirm') })
        : t('detail.relapseMessageNoTarget', { finish: t('detail.finishConfirm') }),
      confirmText: t('detail.relapseConfirm'),
      onConfirm: () => {
        const todayIso = startOfDay(new Date()).toISOString();
        let newEndDate;
        if (targetDays) {
          // Высчитываем новую дату окончания и сдвигаем её вперед
          newEndDate = addDays(startOfDay(new Date()), targetDays).toISOString();
        }
        recordRelapse(tracker.id, todayIso, newEndDate);
        setModalConfig(prev => ({ ...prev, visible: false }));
      }
    });
  };

  const handleDayPress = (date: Date) => {
    if (!tracker) return;

    if (stats.status === 'COMPLETED') {
      setModalConfig({
        visible: true,
        title: t('detail.completedTitle'),
        message: t('detail.completedMessage'),
        confirmText: t('detail.completedConfirm')
      });
      return;
    }

    const clickedDate = startOfDay(date);
    const clickedIso = clickedDate.toISOString();
    const title = format(clickedDate, 'd MMMM yyyy', { locale: ru });
    const isFuture = clickedDate > startOfDay(new Date());

    let message = '';
    let confirmText;
    let onConfirm;

    if (tracker.type === 'EVENT') {
      if (clickedDate < start) {
        message = t('detail.eventNotStartedMessage');
      } else {
        const passed = differenceInCalendarDays(clickedDate, start);
        if (tracker.isCountDown && end) {
          const left = differenceInCalendarDays(end, clickedDate);
          if (left > 0) {
            message = t('detail.eventCountdownMessage', { passed, left });
          } else if (left === 0) {
            message = t('detail.eventTargetDateMessage');
          } else {
            message = t('detail.eventFinishedMessage');
          }
        } else {
          message = isFuture
            ? t('detail.eventExpectedDayMessage', { passed })
            : t('detail.eventDayMessage', { passed });
        }
      }
    } else { // HABIT
      if (clickedDate < start) {
        const daysUntil = differenceInCalendarDays(start, clickedDate);
        message = t('detail.habitNotStartedMessage', { daysUntil });
      } else {
        const passed = differenceInCalendarDays(clickedDate, start) + 1;
        const targetVal = tracker.goal?.enabled ? tracker.goal.targetValue : undefined;
        const left = targetVal !== undefined ? targetVal - passed : null;
        const isDone = !!history[clickedIso];

        if (isFuture) {
          message = t('detail.habitFutureDayNoGoalMessage', { passed });
          if (left !== null && left > 0) {
            message = t('detail.habitFutureDayWithGoalRemainingMessage', { passed, left });
          }
        } else {
          if (tracker.behavior === 'QUIT') {
            if (isDone) {
              message = t('detail.habitQuitRelapseDoneMessage', { passed });
            } else {
              message = t('detail.habitQuitRelapseNotDoneMessage', { passed });
            }
          } else { // behavior === 'DO'
            onConfirm = () => {
              toggleDay(tracker.id, clickedIso);
              setModalConfig(prev => ({ ...prev, visible: false }));
            };

            if (isDone) {
              if (left !== null && left > 0) {
                message = t('detail.habitDoDoneWithGoalMessage', { passed, left });
              } else {
                message = t('detail.habitDoDoneNoGoalMessage', { passed });
              }
              confirmText = t('detail.confirmRemove');
            } else {
              if (left !== null && left > 0) {
                message = t('detail.habitDoNotDoneWithGoalMessage', { passed, left });
              } else {
                message = t('detail.habitDoNotDoneNoGoalMessage', { passed });
              }
              confirmText = t('detail.confirmDone');
            }
          }
        }
      }
    }

    setModalConfig({ visible: true, title, message, confirmText, onConfirm });
  };

  if (!tracker) return <View style={styles.container} />;

  const statusColor = stats.status === 'PENDING' ? colors.gradients.orange[0] :
    stats.status === 'COMPLETED' ? colors.gradients.green[0] :
      gradient[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsMenuVisible(true)}
          style={[styles.menuButton, isMenuVisible && { backgroundColor: `${gradient[0]}30` }]}
        >
          <MoreVertical color={isMenuVisible ? gradient[0] : colors.text.primary} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[`${gradient[0]}20`, `${gradient[0]}05`]} style={[styles.dashboardCard, { borderColor: `${gradient[0]}40` }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: `${gradient[0]}30` }]}><IconComponent size={24} color={gradient[0]} /></View>
            <View style={styles.titleContainer}>
              <Text style={styles.trackerTitle} numberOfLines={1}>{tracker.title}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{stats.statusText}</Text>
              </View>
            </View>

            {/* БЕЙДЖ РЕКОРДА (Отображается ВСЕГДА для плохих привычек) */}
            {stats.status !== 'PENDING' && tracker.behavior === 'QUIT' && (
              <View style={styles.recordBadge}>
                <Text style={styles.recordBadgeText}>
                  {t('detail.bestStreak', 'Рекорд')}
                </Text>
                <Text style={styles.recordBadgeValue}>{stats.bestCleanStreak}</Text>
              </View>
            )}

          </View>

          {tracker.description ? <Text style={styles.descriptionText} numberOfLines={2}>{tracker.description}</Text> : null}

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

        <Text style={styles.sectionTitle}>{t('detail.activityHistory')}</Text>
        <View style={styles.gridContainer}>
          <TrackerGrid
            type={tracker.type}
            isCountDown={tracker.isCountDown}
            behavior={tracker.behavior}
            goalEnabled={tracker.goal?.enabled}
            targetDays={tracker.goal?.targetValue}
            activeDates={activeDates}
            color={tracker.color || 'today'}
            startDate={start}
            endDate={end || undefined}
            onDayPress={handleDayPress}
          />
        </View>
      </ScrollView>

      <ActionModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        colorGradient={gradient}
        onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
      />

      <Modal visible={isMenuVisible} transparent animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={[styles.dropdownMenu, { borderColor: `${gradient[0]}40` }]}>

            {stats.status !== 'COMPLETED' && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleEdit} activeOpacity={0.7}>
                  <Edit2 size={20} color={colors.text.primary} />
                  <Text style={styles.menuItemText}>{t('detail.edit')}</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                {tracker.behavior === 'QUIT' && (
                  <>
                    <TouchableOpacity style={styles.menuItem} onPress={handleRelapse} activeOpacity={0.7}>
                      <RotateCcw size={20} color={colors.gradients.orange[0]} />
                      <Text style={[styles.menuItemText, { color: colors.gradients.orange[0] }]}>{t('detail.menuRelapse')}</Text>
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                  </>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={handleFinish} activeOpacity={0.7}>
                  <CheckCircle size={20} color={colors.text.primary} />
                  <Text style={styles.menuItemText}>{t('detail.finishConfirm')}</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />
              </>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete} activeOpacity={0.7}>
              <Trash2 size={20} color={colors.gradients.red[0]} />
              <Text style={[styles.menuItemText, { color: colors.gradients.red[0] }]}>{t('common.delete')}</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, zIndex: 10 },
  backButton: { padding: 8 },
  menuButton: { padding: 8, borderRadius: 12 },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  dashboardCard: { marginHorizontal: 16, padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1 },
  trackerTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  recordBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 50,
  },
  recordBadgeText: { color: colors.text.dim, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginBottom: 1, letterSpacing: 0.3 },
  recordBadgeValue: { color: colors.text.primary, fontSize: 16, fontWeight: '800' },

  descriptionText: { color: colors.text.secondary, fontSize: 14, lineHeight: 20, marginBottom: 16, opacity: 0.8 },

  mainStatArea: { alignItems: 'center', paddingVertical: 12, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  mainStatValue: { color: colors.text.primary, fontSize: 64, fontWeight: '900', lineHeight: 70 },
  mainStatLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  subStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  subStatItem: { flex: 1, minWidth: '30%', backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center' },
  subStatValue: { color: colors.text.primary, fontSize: 18, fontWeight: '800', marginBottom: 2 },
  subStatLabel: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionTitle: { paddingHorizontal: 20, marginBottom: 16, color: colors.text.secondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  gridContainer: { paddingHorizontal: 16 },

  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
  dropdownMenu: { position: 'absolute', top: 60, right: 16, backgroundColor: '#1C1C22', borderRadius: 16, borderWidth: 1, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  menuItemText: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 }
});
