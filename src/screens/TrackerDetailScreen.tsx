import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Edit2, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react-native';
import { YearGrid } from '../components/YearGrid';
import colors from '../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export const TrackerDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const { title, type } = route.params as any || { title: 'Tracker', type: 'WILL' };

  // Моковые данные для статистики
  const stats = {
    totalDays: 45, // Всего дней (период)
    completed: 28, // Сколько раз был (отметок)
    percentage: 62, // Процент успеха
    streak: 5,
  };

  // Моковые даты активности для сетки
  const activeDates = ['2026-01-05', '2026-01-07', '2026-01-08', '2026-02-01', '2026-02-14'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ХЕДЕР (Кастомный для этого экрана) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => Alert.alert(t('detail.edit'), t('detail.editMessage'))} style={styles.iconButton}>
            <Edit2 color={colors.text.secondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert(t('detail.delete'), t('detail.deleteConfirm'))} style={styles.iconButton}>
            <Trash2 color={colors.gradients.red[0]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* БЛОК СТАТИСТИКИ */}
        <View style={styles.statsContainer}>
          {/* Главная метрика (Процент или Всего дней) */}
          <LinearGradient
            colors={['rgba(51, 181, 229, 0.1)', 'rgba(51, 181, 229, 0.05)']}
            style={styles.mainStatCard}
          >
            <View style={styles.statHeader}>
              <TrendingUp size={16} color={colors.gradients.future[0]} />
              <Text style={styles.statLabel}>{t('detail.successRate')}</Text>
            </View>
            <Text style={styles.mainStatValue}>{stats.percentage}%</Text>
            <Text style={styles.statSub}>
              {t('detail.checkInsOutOf', { completed: stats.completed, total: stats.totalDays })}
            </Text>
          </LinearGradient>

          {/* Мелкие метрики */}
          <View style={styles.row}>
            <View style={styles.smallStatCard}>
              <Calendar size={16} color={colors.text.dim} />
              <Text style={styles.smallStatValue}>{stats.totalDays}</Text>
              <Text style={styles.smallStatLabel}>{t('detail.totalDays')}</Text>
            </View>
            <View style={styles.smallStatCard}>
              <CheckCircle size={16} color={colors.gradients.today[1]} />
              <Text style={[styles.smallStatValue, { color: colors.gradients.today[1] }]}>
                {stats.streak}
              </Text>
              <Text style={styles.smallStatLabel}>{t('detail.currentStreak')}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('detail.activityHistory')}</Text>

        {/* СЕТКА (В режиме TRACKER) */}
        {/*<View style={styles.gridContainer}>*/}
        {/*  <YearGrid*/}
        {/*    variant="TRACKER"*/}
        {/*    activeDates={activeDates}*/}
        {/*    onDayPress={(date) => Alert.alert("Day", date.toISOString())}*/}
        {/*  />*/}
        {/*</View>*/}

      </ScrollView>
    </SafeAreaView>
  );
};

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
  },
  actions: { flexDirection: 'row', gap: 16 },
  iconButton: { padding: 4 },

  scrollContent: { paddingBottom: 40 },

  statsContainer: { padding: 16, gap: 12 },
  mainStatCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borders.future,
    alignItems: 'center',
  },
  statHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  statLabel: { color: colors.gradients.future[0], fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  mainStatValue: { color: colors.text.primary, fontSize: 42, fontWeight: '800' },
  statSub: { color: colors.text.secondary, fontSize: 12, marginTop: 4 },

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
  smallStatValue: { color: colors.text.primary, fontSize: 24, fontWeight: '700', marginVertical: 4 },
  smallStatLabel: { color: colors.text.dim, fontSize: 11, textTransform: 'uppercase' },

  sectionTitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridContainer: {
    height: 400, // Ограничиваем высоту для скролла сетки внутри скролла страницы
  }
});
