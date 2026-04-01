// src/screens/DayDetailScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle, Circle, CalendarX2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { startOfDay, format, getDayOfYear, getDaysInYear, differenceInCalendarDays, isFuture as isDateFuture } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as Icons from 'lucide-react-native';

import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';

export const DayDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const dateParam = route.params?.date ? new Date(route.params.date) : new Date();
  const selectedDate = startOfDay(dateParam);
  const selectedDateIso = selectedDate.toISOString();

  const trackers = useTrackerStore((state) => state.trackers);
  const toggleDay = useTrackerStore((state) => state.toggleDay);

  const isFuture = isDateFuture(selectedDate) && startOfDay(new Date()).getTime() !== selectedDate.getTime();

  const yearStats = useMemo(() => {
    const dayOfYear = getDayOfYear(selectedDate);
    const totalDays = getDaysInYear(selectedDate);
    const endOfThisYear = new Date(selectedDate.getFullYear(), 11, 31);
    const daysLeft = differenceInCalendarDays(endOfThisYear, selectedDate);
    const progress = Math.round((dayOfYear / totalDays) * 100);

    return { dayOfYear, totalDays, daysLeft, progress };
  }, [selectedDate]);

  const activeTrackers = useMemo(() => {
    return trackers.filter(tracker => {
      const trackerStart = startOfDay(new Date(tracker.startDate || tracker.createdAt));
      const hasStarted = trackerStart <= selectedDate;

      let hasNotEndedBefore = true;
      if (tracker.endDate) {
        const trackerEnd = startOfDay(new Date(tracker.endDate));
        // Трекер показывается включительно до даты своего завершения.
        // На следующий день после завершения он исчезает из этого списка.
        hasNotEndedBefore = selectedDate <= trackerEnd;
      }

      return hasStarted && hasNotEndedBefore;
    });
  }, [trackers, selectedDate]);

  const formattedDate = format(selectedDate, 'd MMMM yyyy', { locale: i18n.language === 'ru' ? ru : undefined });
  const gradient = colors.gradients.purple;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[`${gradient[0]}20`, `${gradient[0]}05`]} style={[styles.dayCard, { borderColor: `${gradient[0]}40` }]}>
          <Text style={styles.dateTitle}>{formattedDate}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{yearStats.dayOfYear}</Text>
              <Text style={styles.statLabel}>{t('day.dayOfYear')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{yearStats.daysLeft}</Text>
              <Text style={styles.statLabel}>{t('day.daysLeft')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{yearStats.progress}%</Text>
              <Text style={styles.statLabel}>{t('day.yearProgress')}</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>{t('day.trackers')}</Text>

        <View style={styles.trackersList}>
          {activeTrackers.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarX2 size={48} color={colors.text.dim} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyStateText}>{t('day.noTrackers')}</Text>
            </View>
          ) : (
            activeTrackers.map(tracker => {
              const IconComponent = (Icons as any)[tracker.icon || 'Activity'] || Icons.Activity;
              const trackerColor = colors.gradients[tracker.color as keyof typeof colors.gradients]?.[0] || colors.gradients.today[0];
              const isCompleted = !!tracker.history[selectedDateIso];

              const trackerStart = startOfDay(new Date(tracker.startDate || tracker.createdAt));
              const trackerEnd = tracker.endDate ? startOfDay(new Date(tracker.endDate)) : null;
              // Считаем трекер завершенным, если выбранная дата >= дате окончания
              const isEnded = trackerEnd ? selectedDate >= trackerEnd : false;

              return (
                // 1. КЛИК ПО ВСЕЙ КАРТОЧКЕ -> ПЕРЕХОД В ДЕТАЛИ
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

                    {/* Логика подписей: Завершено -> Событие -> Бросить -> Внедрить */}
                    {isEnded ? (
                      <Text style={[styles.trackerSubtext, { color: colors.gradients.green[0] }]}>
                        {t('detail.statusCompleted', 'Завершено')}
                      </Text>
                    ) : tracker.type === 'EVENT' ? (
                      <Text style={styles.trackerSubtext}>
                        {tracker.isCountDown && tracker.endDate
                          ? `${t('day.eventLeft')}: ${Math.max(0, differenceInCalendarDays(trackerEnd!, selectedDate))} дн.`
                          : `${t('day.eventPassed')}: ${Math.max(0, differenceInCalendarDays(selectedDate, trackerStart))} дн.`
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
                    {tracker.type === 'HABIT' && tracker.behavior === 'DO' && !isEnded ? (
                      !isFuture ? (
                        <TouchableOpacity
                          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                          onPress={() => toggleDay(tracker.id, selectedDateIso)}
                        >
                          {isCompleted ? (
                            <CheckCircle size={24} color={trackerColor} />
                          ) : (
                            <Circle size={24} color={colors.text.dim} />
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={{ opacity: 0.2 }}>
                          <Circle size={24} color={colors.text.dim} />
                        </View>
                      )
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 8, zIndex: 10 },
  backButton: { padding: 8, alignSelf: 'flex-start' },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  dayCard: { marginHorizontal: 16, padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 32, alignItems: 'center' },
  dateTitle: { color: colors.text.primary, fontSize: 28, fontWeight: '800', marginBottom: 24, textTransform: 'capitalize' },

  statsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 10 },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 16, borderRadius: 16 },
  statValue: { color: colors.text.primary, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: colors.text.dim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionTitle: { paddingHorizontal: 20, marginBottom: 16, color: colors.text.secondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  trackersList: { paddingHorizontal: 16, gap: 12 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C22', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  trackerInfo: { flex: 1 },
  trackerName: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  trackerSubtext: { color: colors.text.dim, fontSize: 13, fontWeight: '500' },

  actionArea: { paddingLeft: 12, justifyContent: 'center', alignItems: 'center' },
  futureText: { color: colors.text.dim, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateText: { color: colors.text.dim, fontSize: 15, fontWeight: '500', textAlign: 'center' }
});
