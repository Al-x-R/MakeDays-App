import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { TrackerType } from '../types';

interface MiniGridProps {
  type: TrackerType;
  color: string;
  isCountDown: boolean;
  isChecked: boolean;
  behavior?: 'DO' | 'QUIT';
}

export const MiniGrid = ({ type, color, isCountDown, isChecked, behavior = 'DO' }: MiniGridProps) => {
  const gradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;
  const TODAY_INDEX = 13;
  const QUIT_HISTORY = Array.from({ length: 13 }, (_, i) => i);
  const DO_HISTORY = [0, 1, 3, 4, 8, 9, 11, 12];

  const renderCell = (i: number) => {
    let isActive = false;
    let isToday = i === TODAY_INDEX;
    let opacity = 1;
    let bgColor = 'rgba(255, 255, 255, 0.08)';
    let activeColor = gradient[0];

    if (type === 'HABIT') {
      if (behavior === 'QUIT') {
        if (i < TODAY_INDEX) {
          isActive = true;
          opacity = 0.6;
        }
        else if (isToday) {
          if (isChecked) {
            isActive = true;
            activeColor = colors.gradients.red[0];
            opacity = 1;
          } else {
            isActive = true;
            opacity = 1;
          }
        }
      } else {
        if (i < TODAY_INDEX && DO_HISTORY.includes(i)) {
          isActive = true;
          opacity = 0.5;
        } else if (isToday) {
          if (isChecked) isActive = true;
        }
      }
    } else {
      if (isCountDown) {
        if (i >= TODAY_INDEX) { isActive = true; opacity = 0.8; if (isToday) opacity = 1; }
      } else {
        if (i <= TODAY_INDEX) { isActive = true; opacity = 0.8; if (isToday) opacity = 1; }
      }
    }

    return (
      <View
        key={i}
        style={[
          styles.cell,
          isActive && { backgroundColor: activeColor, opacity },
          !isActive && { backgroundColor: bgColor },
          isToday && !isActive && { borderWidth: 1, borderColor: activeColor },
          isToday && isActive && behavior === 'QUIT' && isChecked && { backgroundColor: colors.gradients.red[0] }
        ]}
      />
    );
  };

  const renderRow = (startIndex: number) => (
    <View style={styles.row}>
      {Array.from({ length: 7 }, (_, offset) => renderCell(startIndex + offset))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderRow(0)}
      {renderRow(7)}
      {renderRow(14)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', gap: 3 },
  row: { flexDirection: 'row', gap: 3 },
  cell: { width: 10, height: 10, borderRadius: 2 },
});
