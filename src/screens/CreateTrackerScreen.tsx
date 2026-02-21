import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Switch, Modal
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, Check, Calendar as CalendarIcon, Infinity, Hammer, Ban,
  Activity, Zap, Heart, Star, Moon, Sun, Coffee, Music, Code,
  DollarSign, BookOpen, Dumbbell, Briefcase, Smile, Gamepad2
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';
import { TrackerType } from '../types';
import { PreviewCard } from '../components/PreviewCard';

const ICONS = [
  'Activity', 'Zap', 'Heart', 'Star', 'Moon', 'Sun',
  'Coffee', 'Music', 'Code', 'DollarSign', 'BookOpen',
  'Dumbbell', 'Briefcase', 'Smile', 'Gamepad2'
] as const;

const COLOR_OPTIONS = ['today', 'purple', 'green', 'orange', 'red', 'pink', 'blue', 'yellow'] as const;

export const CreateTrackerScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const addTracker = useTrackerStore((state) => state.addTracker);
  const today = startOfDay(new Date());

  // --- STATE ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('Activity');

  const [type, setType] = useState<TrackerType>('HABIT');
  const [habitBehavior, setHabitBehavior] = useState<'DO' | 'QUIT'>('DO');
  const [selectedColor, setSelectedColor] = useState<string>('today');

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 21));
  const [daysInput, setDaysInput] = useState('21');

  const [isInfinite, setIsInfinite] = useState(false);
  const [isCountDown, setIsCountDown] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('end');
  const [tempDate, setTempDate] = useState(new Date());

  // --- HANDLERS ---
  const handleDaysChange = (text: string) => {
    setDaysInput(text);
    const days = parseInt(text);
    if (!isNaN(days) && days >= 0) setEndDate(addDays(startDate, days));
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    if (pickerMode === 'start') {
      setStartDate(date);
      const days = parseInt(daysInput) || 0;
      setEndDate(addDays(date, days));
    } else {
      setEndDate(date);
      const diff = differenceInCalendarDays(date, startDate);
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

  const handleCreate = () => {
    if (!title.trim()) return;

    const config: any = {
      description,
      icon: selectedIcon,
      startDate: startDate,
    };

    if (type === 'HABIT') {
      config.behavior = habitBehavior;
      config.goalEnabled = !isInfinite;
      if (!isInfinite) { config.endDate = endDate; config.targetDays = parseInt(daysInput) || 0; }
    } else {
      config.endDate = endDate; config.isCountDown = isCountDown; config.targetDays = parseInt(daysInput) || 0; config.goalEnabled = true;
    }
    addTracker(title, type, selectedColor, config);
    navigation.goBack();
  };

  const inputsDisabled = type === 'HABIT' && isInfinite;

  const renderIconItem = (iconName: string) => {
    const IconLib = require('lucide-react-native');
    const IconComp = IconLib[iconName] || Activity;
    const isSelected = selectedIcon === iconName;

    return (
      <TouchableOpacity
        key={iconName}
        onPress={() => setSelectedIcon(iconName)}
        style={[styles.iconItem, isSelected && styles.iconItemSelected]}
      >
        <IconComp size={20} color={isSelected ? '#fff' : colors.text.dim} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('create.title')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <X color={colors.text.secondary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <PreviewCard
            title={title} type={type} color={selectedColor}
            daysInput={daysInput} isInfinite={isInfinite} isCountDown={isCountDown}
            behavior={habitBehavior} icon={selectedIcon}
          />

          {/* NAME & DESCRIPTION */}
          <View style={styles.compactRow}>
            <Text style={styles.label}>{t('create.identity')}</Text>
            <TextInput
              style={styles.inputCompact}
              placeholder={t('create.namePlaceholder')}
              placeholderTextColor={colors.text.dim}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.inputCompact, { marginTop: 8, height: undefined, minHeight: 44 }]}
              placeholder={t('create.descPlaceholder')}
              placeholderTextColor={colors.text.dim}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* TYPE SELECTOR */}
          <View style={styles.compactRow}>
            <Text style={styles.label}>{t('create.typeAndMode')}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.selectBtn, type === 'HABIT' && styles.selectBtnActive]} onPress={() => setType('HABIT')}>
                <Text style={[styles.selectBtnText, type === 'HABIT' && styles.selectBtnTextActive]}>{t('create.habit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, type === 'EVENT' && styles.selectBtnActive]} onPress={() => setType('EVENT')}>
                <Text style={[styles.selectBtnText, type === 'EVENT' && styles.selectBtnTextActive]}>{t('create.event')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {type === 'HABIT' && (
            <View style={[styles.compactRow, {marginTop: -6}]}>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.modeBtn, habitBehavior === 'DO' && styles.modeBtnActive]} onPress={() => setHabitBehavior('DO')}>
                  <Hammer size={16} color={habitBehavior === 'DO' ? colors.text.primary : colors.text.dim} />
                  <Text style={[styles.modeTitle, habitBehavior === 'DO' && styles.modeTitleActive]}>{t('create.build')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modeBtn, habitBehavior === 'QUIT' && styles.modeBtnQuitActive]} onPress={() => setHabitBehavior('QUIT')}>
                  <Ban size={16} color={habitBehavior === 'QUIT' ? colors.gradients.red[0] : colors.text.dim} />
                  <Text style={[styles.modeTitle, habitBehavior === 'QUIT' && styles.modeTitleActive]}>{t('create.quit')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* DATES & GOALS */}
          <View style={styles.compactSection}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>{type === 'HABIT' ? t('create.duration') : t('create.timeline')}</Text>
              {type === 'HABIT' && (
                <View style={styles.switchContainer}><Text style={styles.switchText}>{t('create.infinite')}</Text><Switch value={isInfinite} onValueChange={setIsInfinite} trackColor={{false:'#333', true:colors.gradients.today[1]}} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} /></View>
              )}
              {type === 'EVENT' && (
                <View style={styles.switchContainer}><Text style={styles.switchText}>{t('create.countdown')}</Text><Switch value={isCountDown} onValueChange={setIsCountDown} trackColor={{false:'#333', true:colors.gradients.future[1]}} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} /></View>
              )}
            </View>

            <View style={styles.row}>
              {/* Start Date Button */}
              <TouchableOpacity style={styles.dateBtn} onPress={() => openDatePicker('start')}>
                <Text style={styles.dateLabelSmall}>{t('create.start')}</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
                  <CalendarIcon color={colors.text.secondary} size={16} />
                  <Text style={styles.dateText}>
                    {format(startDate, 'MMM dd, yyyy')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* End Date Button */}
              <TouchableOpacity
                style={[styles.dateBtn, inputsDisabled && {opacity: 1, backgroundColor: '#0A0A0A', borderColor: '#222'}]}
                onPress={() => openDatePicker('end')}
                disabled={inputsDisabled}
              >
                <Text style={styles.dateLabelSmall}>{t('create.end')}</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
                  {inputsDisabled ? (
                    <Text style={[styles.dateText, {color: colors.text.dim, fontSize: 18}]}>—</Text>
                  ) : (
                    <>
                      <CalendarIcon color={colors.gradients.today[0]} size={16} />
                      <Text style={[styles.dateText, {color: colors.text.primary}]}>
                        {format(endDate, 'MMM dd, yyyy')}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.daysBubble}>
              {inputsDisabled ? (
                <Text style={[styles.daysInputClean, {fontSize: 18}]}>∞</Text>
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

          {/* ICON SELECTOR */}
          <View style={styles.compactRow}>
            <Text style={styles.label}>{t('create.icon')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScroll}>
              {ICONS.map(renderIconItem)}
            </ScrollView>
          </View>

          {/* COLORS */}
          <Text style={[styles.label, { marginTop: 8 }]}>{t('create.color')}</Text>
          <View style={styles.colorsGrid}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setSelectedColor(c)}>
                <LinearGradient colors={colors.gradients[c as keyof typeof colors.gradients] || colors.gradients.today} style={[styles.colorCircle, selectedColor === c && styles.colorCircleSelected]}>
                  {selectedColor === c && <Check color="#fff" size={14} strokeWidth={3} />}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleCreate} disabled={!title.trim()}>
            <LinearGradient colors={title.trim() ? colors.gradients[selectedColor as keyof typeof colors.gradients] || colors.gradients.today : ['#333', '#333']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.createButton}>
              <Text style={styles.createButtonText}>
                {type === 'HABIT' ? (habitBehavior === 'QUIT' ? t('create.btnStartQuitting') : t('create.btnStartHabit')) : t('create.btnTrackEvent')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* MODAL DATE PICKER */}
        {Platform.OS === 'ios' && (
          <Modal transparent visible={showDatePicker} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>

                {/* --- HEADER ROW (TITLE + BADGE) --- */}
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
                  onChange={(e,d) => d && setTempDate(d)}
                  themeVariant="dark"
                  textColor="#fff"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.btnCancel}><Text style={styles.btnText}>{t('common.cancel')}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDateConfirm(tempDate)} style={styles.btnConfirm}><Text style={styles.btnTextBold}>{t('common.confirm')}</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === 'android' && showDatePicker && <DateTimePicker value={tempDate} mode="date" display="default" onChange={(e,d) => { if(d) handleDateConfirm(d); else setShowDatePicker(false); }} />}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: colors.borders.past },
  headerTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  closeButton: { padding: 4 },
  content: { padding: 16 },

  label: { color: colors.text.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  inputCompact: { backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 8, padding: 12, color: colors.text.primary, fontSize: 16 },
  compactRow: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8 },
  // ICONS
  iconScroll: { gap: 8, paddingRight: 20 },
  iconItem: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.borders.past, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F12' },
  iconItemSelected: { borderColor: colors.gradients.today[0], backgroundColor: 'rgba(0, 210, 255, 0.1)' },
  selectBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.borders.past, backgroundColor: '#0F0F12', alignItems: 'center' },
  selectBtnActive: { borderColor: colors.gradients.today[1], backgroundColor: 'rgba(0, 210, 255, 0.05)' },
  selectBtnText: { color: colors.text.secondary, fontWeight: '600', fontSize: 14 },
  selectBtnTextActive: { color: colors.text.primary },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.borders.past, backgroundColor: '#0F0F12' },
  modeBtnActive: { borderColor: colors.gradients.today[1], backgroundColor: 'rgba(0, 210, 255, 0.05)' },
  modeBtnQuitActive: { borderColor: colors.gradients.red[1], backgroundColor: 'rgba(255, 69, 58, 0.05)' },
  modeTitle: { color: colors.text.secondary, fontWeight: '700', fontSize: 13 },
  modeTitleActive: { color: colors.text.primary },
  compactSection: { marginBottom: 16 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchText: { color: colors.text.dim, fontSize: 11 },
  dateBtn: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 8, padding: 12, height: 56 },
  dateLabelSmall: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  dateText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },
  daysBubble: { alignSelf: 'center', marginTop: -8, backgroundColor: '#1A1A1E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.borders.past, flexDirection: 'row', alignItems: 'center', gap: 4 },
  daysInputClean: { color: colors.text.primary, fontSize: 12, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  daysSuffixClean: { color: colors.text.dim, fontSize: 11 },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  colorCircleSelected: { opacity: 1, borderWidth: 2, borderColor: '#fff' },
  footer: { padding: 16, borderTopWidth: 1, borderColor: colors.borders.past, backgroundColor: colors.background },
  createButton: { padding: 14, borderRadius: 12, alignItems: 'center' },
  createButtonText: { color: colors.text.inverse, fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16 },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  modalBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
  },
  modalBadgeText: {
    color: colors.gradients.today[0],
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: colors.gradients.today[1], alignItems: 'center' },
  btnText: { color: '#fff' },
  btnTextBold: { color: '#000', fontWeight: '700' },
});
