import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X as XIcon, Flame, Ban } from 'lucide-react-native';
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
}

export const PreviewCard = ({
  title, type, color, daysInput, isInfinite, isCountDown, behavior = 'DO'
}: PreviewCardProps) => {

  const [isChecked, setIsChecked] = useState(false);
  const gradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;

  useEffect(() => { setIsChecked(false); }, [type, behavior]);

  let subText = "";
  if (type === 'HABIT') {
    if (behavior === 'QUIT') subText = "Days streak";
    else subText = isInfinite ? "Daily goal" : `${daysInput} days goal`;
  } else {
    subText = isCountDown ? "Days left" : "Days passed";
  }

  const renderAction = () => {
    if (type === 'EVENT') {
      return <Text style={[styles.bigNumber, { color: gradient[0] }]}>{daysInput}</Text>;
    }

    if (behavior === 'QUIT') {
      return (
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)} activeOpacity={0.7}>
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
      <TouchableOpacity onPress={() => setIsChecked(!isChecked)} activeOpacity={0.7}>
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
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{title || "Name..."}</Text>
          <Text style={styles.subText}>{subText}</Text>
        </View>

        <View style={styles.gridContainer}>
          <MiniGrid
            type={type}
            color={color}
            isCountDown={isCountDown}
            isChecked={isChecked}
            behavior={behavior}
          />
        </View>

        <View style={styles.actionContainer}>
          {renderAction()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  label: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1, alignSelf: 'center' },

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

  infoContainer: { flex: 1, marginRight: 8, justifyContent: 'center' },
  title: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  subText: { color: colors.text.dim, fontSize: 11 },

  gridContainer: { alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },

  actionContainer: { width: 40, alignItems: 'flex-end', justifyContent: 'center' },

  checkbox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },

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
