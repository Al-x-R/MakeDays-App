// src/screens/TrackerDetailScreen.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Edit2, Trash2, CheckCircle, MoreVertical } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { differenceInCalendarDays, startOfDay, eachDayOfInterval, format } from 'date-fns';
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

  // Стейты
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  useEffect(() => {
    if (!tracker) navigation.goBack();
  }, [tracker, navigation]);

  if (!tracker) return null;

  const gradient = colors.gradients[tracker.color as keyof typeof colors.gradients] || colors.gradients.today;
  const IconComponent = (Icons as any)[tracker.icon || 'Activity'] || Icons.Activity;

  const start = startOfDay(new Date(tracker.startDate || tracker.createdAt));
  const end = tracker.endDate ? startOfDay(new Date(tracker.endDate)) : null;
  const history = tracker.history || {};
  const activeDates = Object.keys(history).filter(k => history[k]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const daysToStart = differenceInCalendarDays(start, today);
    let status: 'PENDING' | 'ACTIVE' | 'COMPLETED' = 'ACTIVE';

    if (daysToStart > 0) {
      status = 'PENDING';
    } else if (end && today >= end) {
      status = 'COMPLETED';
    }

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
      subStats.push({ label: t('create.typeAndMode', 'Тип'), value: tracker.type === 'EVENT' ? 'EVENT' : (tracker.behavior || 'DO') });
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

  // --- MENU HANDLERS ---
  const handleEdit = () => {
    setIsMenuVisible(false);
    navigation.navigate('EditTracker', { id: tracker.id });
  };

  const handleFinish = () => {
    setIsMenuVisible(false);
    Alert.alert(
      'Завершить трекер?',
      'Вы больше не сможете отмечать новые дни, но вся история сохранится.',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Завершить',
          style: 'destructive',
          onPress: () => finishTracker(tracker.id)
        }
      ]
    );
  };

  const handleDelete = () => {
    setIsMenuVisible(false);
    Alert.alert(t('detail.delete', 'Удалить'), t('detail.deleteConfirm', 'Вы уверены?'), [
      { text: t('common.cancel', 'Отмена'), style: 'cancel' },
      { text: t('common.delete', 'Удалить'), style: 'destructive', onPress: () => { deleteTracker(tracker.id); } }
    ]);
  };

  const handleDayPress = (date: Date) => {
    const clickedDate = startOfDay(date);
    const clickedIso = clickedDate.toISOString();
    const title = format(clickedDate, 'd MMMM yyyy', { locale: ru });
    const isFuture = clickedDate > startOfDay(new Date());

    let message = '';
    let confirmText;
    let onConfirm;

    if (stats.status === 'COMPLETED') {
      setModalConfig({
        visible: true,
        title: 'Трекер завершен 🏁',
        message: 'Вы больше не можете вносить изменения в историю этого трекера.',
        confirmText: 'Понятно'
      });
      return;
    }

    if (tracker.type === 'EVENT') {
      if (clickedDate < start) {
        message = 'Событие тогда еще не началось ⏳\nВсё самое интересное было впереди!';
      } else {
        const passed = differenceInCalendarDays(clickedDate, start);
        if (tracker.isCountDown && end) {
          const left = differenceInCalendarDays(end, clickedDate);
          if (left > 0) message = `🗓 Прошло с начала: ${passed} дн.\n🎯 До финиша оставалось: ${left} дн.\n\n💪 Шаг за шагом к цели!`;
          else if (left === 0) message = `🎉 День X! Тот самый день настал!`;
          else message = `✅ Событие завершилось!\nНадеюсь, всё прошло просто супер 😎`;
        } else {
          message = isFuture
            ? `🚀 Это будет ${passed}-й день с начала события.\nВсё идет по плану!`
            : `🚀 Это был ${passed}-й день с начала события.\n\n✨ Время летит, так держать!`;
        }
      }
    } else {
      if (clickedDate < start) {
        const daysUntil = differenceInCalendarDays(start, clickedDate);
        message = `⏳ Трекер еще не стартовал.\nОсталось до начала: ${daysUntil} дн.\n\nНабирайся сил и готовься!`;
      } else {
        const passed = differenceInCalendarDays(clickedDate, start) + 1;

        const targetVal = tracker.goal?.enabled ? tracker.goal.targetValue : undefined;
        const left = targetVal !== undefined ? targetVal - passed : null;

        const isDone = !!history[clickedIso];

        if (isFuture) {
          const habitStr = tracker.behavior === 'QUIT' ? 'избавления от привычки' : 'выработки привычки';
          message = `🚀 Это будет ${passed}-й день ${habitStr}.`;
          if (left !== null && left > 0) {
            message += `\n\nЕсли дойдешь до него — ты красава! Останется продержаться еще ${left} дн.`;
          } else {
            message += `\n\nПродолжай в том же духе, шаг за шагом!`;
          }
        } else {
          onConfirm = () => {
            toggleDay(tracker.id, clickedIso);
            setModalConfig(prev => ({ ...prev, visible: false }));
          };

          if (tracker.behavior === 'QUIT') {
            if (isDone) {
              message = `❌ В этот день (${passed}-й с начала) был зафиксирован фейл.\n\nОшибся кнопкой? Хочешь отменить?`;
              confirmText = "Убрать срыв";
            } else {
              message = `🛡️ ${passed}-й день с начала. Ты держался молодцом!\n\nСлучайно сорвался? Можешь отметить этот день как фейл.`;
              confirmText = "Сорвался";
            }
          } else { // DO
            if (isDone) {
              message = `✅ ${passed}-й день. Привычка выполнена, ты красава!\n\nХочешь убрать отметку?`;
              confirmText = "Убрать отметку";
            } else {
              message = `⏳ Это твой ${passed}-й день с начала.\n\nХочешь отметить его как выполненный?`;
              confirmText = "Отметить выполнение";
            }
          }
        }
      }
    }

    setModalConfig({ visible: true, title, message, confirmText, onConfirm });
  };

  const statusColor = stats.status === 'PENDING' ? colors.gradients.orange[0] :
    stats.status === 'COMPLETED' ? colors.gradients.green[0] :
      gradient[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* HEDER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>

        {/* MENU BUTTON */}
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

        <Text style={styles.sectionTitle}>{t('detail.activityHistory', 'История активности')}</Text>
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

      {/*  ACTION MODAL (Calendar)  */}
      <ActionModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        colorGradient={gradient}
        onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
      />

      {/*  DROP-DOWN MENU  */}
      <Modal visible={isMenuVisible} transparent animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={() => setIsMenuVisible(false)}>
          <View style={[styles.dropdownMenu, { borderColor: `${gradient[0]}40` }]}>

            <TouchableOpacity style={styles.menuItem} onPress={handleEdit} activeOpacity={0.7}>
              <Edit2 size={20} color={colors.text.primary} />
              <Text style={styles.menuItemText}>Редактировать</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleFinish} activeOpacity={0.7}>
              <CheckCircle size={20} color={colors.text.primary} />
              <Text style={styles.menuItemText}>Завершить</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete} activeOpacity={0.7}>
              <Trash2 size={20} color={colors.gradients.red[0]} />
              <Text style={[styles.menuItemText, { color: colors.gradients.red[0] }]}>Удалить</Text>
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
  gridContainer: { paddingHorizontal: 16 },

  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#1C1C22',
    borderRadius: 16,
    borderWidth: 1,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  menuItemText: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 }
});
