// src/screens/ListScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import colors from '../constants/colors';
import { useTrackerStore } from '../store/useTrackerStore';
import { startOfDay, differenceInCalendarDays } from 'date-fns';
import * as Icons from 'lucide-react-native';
import { CheckCircle, Circle } from 'lucide-react-native';

export const ListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { trackers, toggleDay } = useTrackerStore();

  const todayDate = startOfDay(new Date());
  const todayIso = todayDate.toISOString();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {trackers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('list.noTrackers')}</Text>
            <Text style={styles.emptySubText}>{t('list.pressToCreate')}</Text>
          </View>
        ) : (
          trackers.map((tracker) => {
            const IconComponent = (Icons as any)[tracker.icon || 'Activity'] || Icons.Activity;
            const trackerColor = colors.gradients[tracker.color as keyof typeof colors.gradients]?.[0] || colors.gradients.today[0];
            const isCompleted = !!tracker.history[todayIso];

            // Проверки времени жизни трекера
            const trackerStart = startOfDay(new Date(tracker.startDate || tracker.createdAt));
            const trackerEnd = tracker.endDate ? startOfDay(new Date(tracker.endDate)) : null;

            const isPending = todayDate < trackerStart;
            const isEnded = trackerEnd ? todayDate >= trackerEnd : false;

            return (
              <TouchableOpacity
                key={tracker.id}
                style={styles.trackerRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TrackerDetail', { id: tracker.id })}
              >
                <View style={[styles.iconBox, { backgroundColor: `${trackerColor}20` }]}>
                  <IconComponent size={20} color={trackerColor} />
                </View>

                <View style={styles.trackerInfo}>
                  <Text style={styles.trackerName} numberOfLines={1}>{tracker.title}</Text>

                  {isEnded ? (
                    <Text style={[styles.trackerSubtext, { color: colors.gradients.green[0] }]}>
                      {t('detail.statusCompleted', 'Завершено')}
                    </Text>
                  ) : isPending ? (
                    <Text style={[styles.trackerSubtext, { color: colors.gradients.orange[0] }]}>
                      {t('detail.statusPending', 'Ожидание')} (со старта: {formatDate(trackerStart)})
                    </Text>
                  ) : tracker.type === 'EVENT' ? (
                    <Text style={styles.trackerSubtext}>
                      {tracker.isCountDown && tracker.endDate
                        ? `${t('day.eventLeft', 'Осталось')}: ${Math.max(0, differenceInCalendarDays(trackerEnd!, todayDate))} дн.`
                        : `${t('day.eventPassed', 'Прошло')}: ${Math.max(0, differenceInCalendarDays(todayDate, trackerStart))} дн.`
                      }
                    </Text>
                  ) : tracker.behavior === 'QUIT' ? (
                    <Text style={[styles.trackerSubtext, isCompleted && { color: colors.gradients.red[0] }]}>
                      {isCompleted ? 'Срыв' : 'Чисто'}
                    </Text>
                  ) : (
                    <Text style={styles.trackerSubtext}>{t('create.habit')}</Text>
                  )}
                </View>

                <View style={styles.actionArea}>
                  {tracker.type === 'HABIT' && tracker.behavior === 'DO' && !isEnded && !isPending ? (
                    <TouchableOpacity
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                      onPress={() => toggleDay(tracker.id, todayIso)}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} color={trackerColor} />
                      ) : (
                        <Circle size={24} color={colors.text.dim} />
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Вспомогательная функция для красивой даты ожидания
const formatDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}.${m}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },

  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: 18, fontWeight: '600' },
  emptySubText: { color: colors.text.dim, marginTop: 8 },

  // Стили карточки, 1 в 1 как в DayDetailScreen
  trackerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C22', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  trackerInfo: { flex: 1 },
  trackerName: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  trackerSubtext: { color: colors.text.dim, fontSize: 13, fontWeight: '500' },
  actionArea: { paddingLeft: 12, justifyContent: 'center', alignItems: 'center' },
});
