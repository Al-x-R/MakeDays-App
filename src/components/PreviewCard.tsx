import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X as XIcon, Ban, Activity } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import colors from '../constants/colors';
import { TrackerType } from '../types';
import { MiniGrid } from './MiniGrid';

interface PreviewCardProps {
  title: string;
  type: TrackerType;
  color: string;
  daysInput: string;
  isInfinite: boolean;
  isCountDown: boolean;
  behavior?: 'DO' | 'QUIT';
  icon?: string;
}

export const PreviewCard = ({
  title,
  type,
  color,
  daysInput,
  isInfinite,
  isCountDown,
  behavior = 'DO',
  icon = 'Activity'
}: PreviewCardProps) => {

  const [isChecked, setIsChecked] = useState(false);
  const gradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;

  useEffect(() => { setIsChecked(false); }, [type, behavior]);

  let subText = "";
  if (type === 'HABIT') {
    if (behavior === 'QUIT') {
      subText = "Days streak";
    } else {
      subText = isInfinite ? "Daily goal" : `${daysInput}d goal`;
    }
  } else {
    subText = isCountDown ? "Left" : "Passed";
  }

  const IconComponent = (Icons as any)[icon] || Activity;

  const renderAction = () => {
    if (type === 'EVENT') {
      return <Text style={[styles.bigNumber, { color: gradient[0] }]}>{daysInput}</Text>;
    }

    if (behavior === 'QUIT') {
      return (
        <TouchableOpacity
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, styles.quitCheckbox, isChecked && styles.quitCheckboxActive]}>
            {isChecked
              ? <XIcon size={18} color="#fff" strokeWidth={3} />
              : <Ban size={18} color={colors.gradients.red[0]} strokeWidth={2} style={{opacity: 0.7}} />
            }
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => setIsChecked(!isChecked)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isChecked ? gradient : ['transparent', 'transparent']}
          style={[styles.checkbox, { borderColor: gradient[1] }]}
        >
          {isChecked && <Check size={16} color="#fff" strokeWidth={3} />}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PREVIEW</Text>

      <View style={styles.card}>

        {/* 1. LEFT: INFO */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            {/* Иконка трекера */}
            <IconComponent size={18} color={gradient[0]} style={{marginRight: 6}} />
            <Text style={styles.title} numberOfLines={1}>
              {title || "Name..."}
            </Text>
          </View>
          <Text style={styles.subText}>{subText}</Text>
        </View>

        {/* 2. CENTER: GRID */}
        <View style={styles.gridContainer}>
          <MiniGrid
            type={type}
            color={color}
            isCountDown={isCountDown}
            isChecked={isChecked}
            behavior={behavior}
          />
        </View>

        {/* 3. RIGHT: ACTION */}
        <View style={styles.actionContainer}>
          {renderAction()}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  label: {
    color: colors.text.dim,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
    alignSelf: 'flex-start'
  },

  card: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(20, 25, 30, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borders.past,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoContainer: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  title: { color: colors.text.primary, fontSize: 16, fontWeight: '700', flex: 1 },
  subText: { color: colors.text.dim, fontSize: 11 },

  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    // Убрали flex, чтобы сетка занимала только необходимое ей место
  },

  actionContainer: {
    width: 40, // Фиксированная ширина, чтобы верстка не прыгала
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  checkbox: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
  },

  // Стили для красной кнопки (Quit)
  quitCheckbox: {
    borderColor: 'rgba(255, 69, 58, 0.5)',
    backgroundColor: 'rgba(255, 69, 58, 0.1)'
  },
  quitCheckboxActive: {
    backgroundColor: colors.gradients.red[0],
    borderColor: colors.gradients.red[0],
  },

  bigNumber: { fontSize: 20, fontWeight: '800' },
});
