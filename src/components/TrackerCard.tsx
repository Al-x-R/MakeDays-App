// src/components/TrackerCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import colors from '../constants/colors';
import { TrackerType } from '../types';

interface TrackerCardProps {
  id: string;
  title: string;
  type: TrackerType;
  streak?: number;
  todayCompleted?: boolean;
  onPress: () => void;
  onCheck?: () => void;
}

export const TrackerCard = ({
  title,
  type,
  streak = 0,
  todayCompleted = false,
  onPress,
  onCheck
}: TrackerCardProps) => {
  const { t } = useTranslation();
  const activeGradient = type === 'EVENT'
    ? colors.gradients.future
    : colors.gradients.today;

  const mockDots = [true, true, false, true, todayCompleted];

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.statsRow}>
          {type === 'HABIT' ? (
            <>
              <Flame
                size={14}
                color={streak > 0 ? colors.gradients.future[0] : colors.text.dim}
                fill={streak > 0 ? colors.gradients.future[0] : 'transparent'}
              />
              <Text style={[
                styles.streakText,
                streak > 0 && { color: colors.text.secondary }
              ]}>
                {t('card.dayStreak', { count: streak })}
              </Text>
            </>
          ) : (
            <>
              <ArrowUpCircle size={14} color={colors.gradients.future[0]} />
              <Text style={styles.streakText}>{t('card.trackingEvent')}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>

        <View style={styles.miniHeatmap}>
          {mockDots.map((isActive, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive
                    ? colors.gradients.future[0]
                    : colors.borders.past
                }
              ]}
            />
          ))}
        </View>

        {type === 'HABIT' && (
          <TouchableOpacity onPress={onCheck} activeOpacity={0.7}>
            <LinearGradient
              colors={todayCompleted ? activeGradient : ['transparent', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.checkButton,
                !todayCompleted && { borderWidth: 1, borderColor: colors.borders.future }
              ]}
            >
              {todayCompleted && (
                <Check size={18} color={colors.text.inverse} strokeWidth={3} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20, 25, 30, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borders.past,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    color: colors.text.dim,
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  miniHeatmap: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
