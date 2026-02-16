import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
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
}

export const PreviewCard = ({
  title, type, color, daysInput, isInfinite, isCountDown
}: PreviewCardProps) => {

  const [isChecked, setIsChecked] = useState(false);
  const gradient = colors.gradients[color as keyof typeof colors.gradients] || colors.gradients.today;

  useEffect(() => { setIsChecked(false); }, [type]);

  let subText = type === 'HABIT'
    ? (isInfinite ? "Infinite" : `${daysInput} days`)
    : (isCountDown ? "Left" : "Passed");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PREVIEW</Text>

      <View style={styles.card}>

        {/* 1. LEFT: INFO */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title || "Name..."}
          </Text>
          <Text style={styles.subText}>{subText}</Text>
        </View>

        <View style={styles.gridContainer}>
          <MiniGrid
            type={type}
            color={color}
            isCountDown={isCountDown}
            isChecked={isChecked}
          />
        </View>

        {/* 3. RIGHT: ACTION */}
        <View style={styles.actionContainer}>
          {type === 'HABIT' ? (
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
          ) : (
            <Text style={[styles.bigNumber, { color: gradient[0] }]}>
              {daysInput}
            </Text>
          )}
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
  title: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  subText: { color: colors.text.dim, fontSize: 11 },

  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 20,
  },

  actionContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  checkbox: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
  },
  bigNumber: { fontSize: 20, fontWeight: '800' },
});
