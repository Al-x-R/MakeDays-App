import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  title, type, color, daysInput, isInfinite, isCountDown, behavior = 'DO', icon = 'Activity'
}: PreviewCardProps) => {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const gradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;

  useEffect(() => { setIsChecked(false); }, [type, behavior]);

  let infoText = "";
  let typeLabel = "";

  if (type === 'HABIT') {
    typeLabel = behavior === 'QUIT' ? "HABIT • QUIT" : "HABIT • BUILD";
    const daysNum = parseInt(daysInput, 10) || 0;
    const goalDisplay = isInfinite ? "∞" : t('create.daysCount', { count: daysNum });
    infoText = t('card.goal') + goalDisplay;
  } else {
    typeLabel = isCountDown ? "EVENT • LEFT" : "EVENT • PASSED";
    const daysNum = parseInt(daysInput, 10) || 0;
    infoText = t('card.target') + t('create.daysCount', { count: daysNum });
  }

  const IconComponent = (Icons as any)[icon] || Activity;

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
      <Text style={styles.label}>{t('create.preview')}</Text>
      <View style={styles.card}>

        {/* --- LEFT: INFO --- */}
        <View style={styles.infoContainer}>
          {/* Row 1: Icon + Name */}
          <View style={styles.titleRow}>
            <IconComponent size={18} color={gradient[0]} style={{marginRight: 6}} />
            <Text style={styles.title} numberOfLines={1}>{title || t('create.defaultName')}</Text>
          </View>

          {/* Row 2: Goal/Target */}
          <Text style={styles.infoText} numberOfLines={1}>{infoText}</Text>

          {/* Row 3: Type Label */}
          <Text style={[styles.typeLabel, { color: gradient[0] }]} numberOfLines={1}>
            {typeLabel}
          </Text>
        </View>

        {/* --- CENTER: GRID --- */}
        <View style={styles.gridContainer}>
          <MiniGrid
            type={type}
            color={color}
            isCountDown={isCountDown}
            isChecked={isChecked}
            behavior={behavior}
          />
        </View>

        {/* --- RIGHT: ACTION --- */}
        <View style={styles.actionContainer}>
          {renderAction()}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  label: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1, alignSelf: 'flex-start' },
  card: {
    width: '100%',
    height: 84,
    backgroundColor: 'rgba(20, 25, 30, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borders.past,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: { flex: 1, justifyContent: 'center', marginRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  title: { color: colors.text.primary, fontSize: 16, fontWeight: '700', flex: 1 },
  infoText: { color: colors.text.secondary, fontSize: 12, marginBottom: 3, fontWeight: '500' },
  typeLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, letterSpacing: 0.5 },
  gridContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  actionContainer: { minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' },
  checkbox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  quitCheckbox: { borderColor: 'rgba(255, 69, 58, 0.5)', backgroundColor: 'rgba(255, 69, 58, 0.1)' },
  quitCheckboxActive: { backgroundColor: colors.gradients.red[0], borderColor: colors.gradients.red[0] },
  bigNumber: { fontSize: 20, fontWeight: '800' },
});
