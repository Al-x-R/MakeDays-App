import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Check, Activity } from 'lucide-react-native'; // Правильный импорт
import colors from '../constants/colors';

interface TrackerCardProps {
  id: string;
  title: string;
  type: 'FATE' | 'WILL';
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

  // Цвета для градиента кнопки
  const activeGradient = type === 'FATE'
    ? colors.gradients.future
    : colors.gradients.today;

  // Моковые точки активности (последние 5 дней)
  const mockDots = [true, true, false, true, todayCompleted];

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Левая часть: Инфо */}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>

        {/* Строка со страйком (иконка огонька) */}
        <View style={styles.statsRow}>
          <Flame
            size={14}
            color={streak > 0 ? colors.gradients.future[0] : colors.text.dim}
            fill={streak > 0 ? colors.gradients.future[0] : 'transparent'} // Заливка огонька
          />
          <Text style={[
            styles.streakText,
            streak > 0 && { color: colors.text.secondary }
          ]}>
            {streak} day streak
          </Text>
        </View>
      </View>

      {/* Правая часть: Мини-хитмэп и Кнопка */}
      <View style={styles.actions}>

        {/* Мини-хитмэп (точки) */}
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

        {/* Кнопка Чек-ин (Только для привычек/WILL) */}
        {type === 'WILL' && (
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
    backgroundColor: 'rgba(20, 25, 30, 0.6)', // Темное стекло
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
