// src/screens/EditTrackerScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Alert, Modal, Platform, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Calendar as CalendarIcon, Activity } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { format, addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';

const ICONS = [
  'Activity', 'Zap', 'Heart', 'Star', 'Moon', 'Sun',
  'Coffee', 'Music', 'Code', 'DollarSign', 'BookOpen',
  'Dumbbell', 'Briefcase', 'Smile', 'Gamepad2'
] as const;

const COLOR_OPTIONS = ['today', 'purple', 'green', 'orange', 'red', 'pink', 'blue', 'yellow'] as const;

export const EditTrackerScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id;

  const tracker = useTrackerStore((state) => state.trackers.find((t) => t.id === id));
  const editTracker = useTrackerStore((state) => state.editTracker);

  const today = startOfDay(new Date());

  const initialStart = tracker?.startDate ? startOfDay(new Date(tracker.startDate)) : today;
  const initialEnd = tracker?.endDate ? startOfDay(new Date(tracker.endDate)) : null;

  const [title, setTitle] = useState(tracker?.title || '');
  const [description, setDescription] = useState(tracker?.description || '');
  const [color, setColor] = useState(tracker?.color || 'today');
  const [icon, setIcon] = useState(tracker?.icon || 'Activity');

  const [isCountDown, setIsCountDown] = useState(tracker?.isCountDown || false);
  const [isInfinite, setIsInfinite] = useState(tracker?.type === 'HABIT' && !tracker?.goal?.enabled);

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd || addDays(initialStart, tracker?.goal?.targetValue || 21));

  const [daysInput, setDaysInput] = useState(
    initialEnd
      ? differenceInCalendarDays(initialEnd, initialStart).toString()
      : (tracker?.goal?.targetValue ? tracker.goal.targetValue.toString() : '21')
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('end');
  const [tempDate, setTempDate] = useState(new Date());

  if (!tracker) return null;

  const handleDaysChange = (text: string) => {
    setDaysInput(text);
    const days = parseInt(text);
    if (!isNaN(days) && days >= 0) setEndDate(addDays(startDate, days));
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    if (pickerMode === 'start') {
      setStartDate(startOfDay(date));
      const days = parseInt(daysInput) || 0;
      setEndDate(addDays(startOfDay(date), days));
    } else {
      setEndDate(startOfDay(date));
      const diff = differenceInCalendarDays(startOfDay(date), startDate);
      setDaysInput(diff >= 0 ? diff.toString() : '0');
    }
  };

  const getModalDifference = () => {
    if (pickerMode === 'start') {
      const diff = differenceInCalendarDays(tempDate, today);
      if (diff === 0) return t('create.startsToday');
      if (diff === 1) return t('create.startsTomorrow');
      if (diff < 0) return t('create.startedDaysAgo', { count: Math.abs(diff) });
      return t('create.startsInDays', { count: diff });
    } else {
      const diff = differenceInCalendarDays(tempDate, startDate);
      if (diff <= 0) return t('create.endAfterStart');
      return t('create.daysCount', { count: diff });
    }
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setPickerMode(mode);
    setTempDate(mode === 'start' ? startDate : endDate);
    setShowDatePicker(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert(t('edit.errorTitle'), t('edit.errorEnterName'));
      return;
    }

    const updates: any = {
      title,
      description,
      color,
      icon,
      startDate: startDate.toISOString(),
    };

    if (tracker.type === 'HABIT') {
      updates.goal = {
        enabled: !isInfinite,
        targetValue: isInfinite ? undefined : (parseInt(daysInput) || 0)
      };
      updates.endDate = isInfinite ? undefined : endDate.toISOString();
    } else {
      updates.isCountDown = isCountDown;
      updates.endDate = endDate.toISOString();
      updates.goal = {
        enabled: true,
        targetValue: parseInt(daysInput) || 0
      };
    }

    editTracker(tracker.id, updates);
    navigation.goBack();
  };

  const inputsDisabled = tracker.type === 'HABIT' && isInfinite;

  const renderIconItem = (iconName: string) => {
    const IconLib = require('lucide-react-native');
    const IconComp = IconLib[iconName] || Activity;
    const isSelected = icon === iconName;

    return (
      <TouchableOpacity
        key={iconName}
        onPress={() => setIcon(iconName)}
        style={[styles.iconItem, isSelected && { borderColor: colors.gradients[color as keyof typeof colors.gradients][0], backgroundColor: `${colors.gradients[color as keyof typeof colors.gradients][0]}15` }]}
      >
        <IconComp size={24} color={isSelected ? colors.gradients[color as keyof typeof colors.gradients][0] : colors.text.dim} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('edit.screenTitle')}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
            <Check color={colors.gradients.green[0]} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.section}>
            <Text style={styles.label}>{t('edit.nameLabel')}</Text>
            <TextInput
              style={styles.inputCompact}
              value={title}
              onChangeText={setTitle}
              placeholder={t('create.namePlaceholder')}
              placeholderTextColor={colors.text.dim}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('edit.descriptionLabel')}</Text>
            <TextInput
              style={[styles.inputCompact, { height: undefined, minHeight: 60, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('edit.descMotivationPlaceholder')}
              placeholderTextColor={colors.text.dim}
              multiline
            />
          </View>

          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>{tracker.type === 'HABIT' ? t('create.duration') : t('create.timeline')}</Text>

              {tracker.type === 'HABIT' && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>{t('create.infinite')}</Text>
                  <Switch value={isInfinite} onValueChange={setIsInfinite} trackColor={{ false: '#333', true: colors.gradients[color as keyof typeof colors.gradients][0] }} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                </View>
              )}

              {tracker.type === 'EVENT' && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>{t('create.countdown')}</Text>
                  <Switch value={isCountDown} onValueChange={setIsCountDown} trackColor={{ false: '#333', true: colors.gradients[color as keyof typeof colors.gradients][0] }} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                </View>
              )}
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.dateBtn} onPress={() => openDatePicker('start')}>
                <Text style={styles.dateLabelSmall}>{t('create.start')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon color={colors.text.secondary} size={16} />
                  <Text style={styles.dateText}>
                    {format(startDate, 'dd MMM yyyy', { locale: ru })}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateBtn, inputsDisabled && { opacity: 1, backgroundColor: '#0A0A0A', borderColor: '#222' }]}
                onPress={() => openDatePicker('end')}
                disabled={inputsDisabled}
              >
                <Text style={styles.dateLabelSmall}>{t('create.end')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {inputsDisabled ? (
                    <Text style={[styles.dateText, { color: colors.text.dim, fontSize: 18 }]}>{t('common.infinitySymbol')}</Text>
                  ) : (
                    <>
                      <CalendarIcon color={colors.gradients[color as keyof typeof colors.gradients][0]} size={16} />
                      <Text style={[styles.dateText, { color: colors.text.primary }]}>
                        {format(endDate, 'dd MMM yyyy', { locale: ru })}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.daysBubble}>
              {inputsDisabled ? (
                <Text style={[styles.daysInputClean, { fontSize: 18 }]}>{t('common.infinitySymbol')}</Text>
              ) : (
                <TextInput
                  style={styles.daysInputClean}
                  value={daysInput}
                  onChangeText={handleDaysChange}
                  keyboardType="numeric"
                />
              )}
              <Text style={styles.daysSuffixClean}>
                {inputsDisabled ? t('create.durationDays') : t('create.totalDays')}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('create.icon')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScroll}>
              {ICONS.map(renderIconItem)}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t('create.color')}</Text>
            <View style={styles.colorsGrid}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setColor(c)}>
                  <LinearGradient
                    colors={colors.gradients[c as keyof typeof colors.gradients] || colors.gradients.today}
                    style={[styles.colorCircle, color === c && styles.colorCircleSelected]}
                  >
                    {color === c && <Check color="#fff" size={16} strokeWidth={3} />}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>

        {Platform.OS === 'ios' && (
          <Modal transparent visible={showDatePicker} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>
                    {pickerMode === 'start' ? t('create.startDate') : t('create.targetDate')}
                  </Text>
                  <View style={styles.modalBadge}>
                    <Text style={styles.modalBadgeText}>{getModalDifference()}</Text>
                  </View>
                </View>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(e, d) => d && setTempDate(d)}
                  themeVariant="dark"
                  textColor="#fff"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.btnCancel}>
                    <Text style={styles.btnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDateConfirm(tempDate)} style={styles.btnConfirm}>
                    <Text style={styles.btnTextBold}>{t('common.confirm')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={(e, d) => { if(d) handleDateConfirm(d); else setShowDatePicker(false); }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borders.past },
  headerTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
  iconButton: { padding: 8 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  section: { marginBottom: 24 },
  label: { color: colors.text.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },

  inputCompact: { backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 12, padding: 14, color: colors.text.primary, fontSize: 16 },

  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchText: { color: colors.text.dim, fontSize: 11 },

  row: { flexDirection: 'row', gap: 8 },
  dateBtn: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 12, padding: 14, height: 60 },
  dateLabelSmall: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  dateText: { color: colors.text.secondary, fontSize: 15, fontWeight: '600' },

  daysBubble: { alignSelf: 'center', marginTop: -10, backgroundColor: '#1A1A1E', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.borders.past, flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 2 },
  daysInputClean: { color: colors.text.primary, fontSize: 14, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  daysSuffixClean: { color: colors.text.dim, fontSize: 12, fontWeight: '600' },

  iconScroll: { gap: 10, paddingRight: 20 },
  iconItem: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.borders.past, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },

  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  colorCircleSelected: { opacity: 1, borderWidth: 3, borderColor: colors.background },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
  modalBadge: { backgroundColor: 'rgba(0, 210, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.2)' },
  modalBadgeText: { color: colors.gradients.today[0], fontSize: 12, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#333', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.gradients.today[1], alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnTextBold: { color: '#000', fontSize: 16, fontWeight: '800' },
});
