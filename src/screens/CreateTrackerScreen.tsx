import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Switch, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Calendar as CalendarIcon, ArrowUpCircle, ArrowDownCircle, Flame, Infinity } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';
import { TrackerType } from '../types';

const COLOR_OPTIONS = ['today', 'purple', 'green', 'orange', 'red', 'pink', 'blue', 'yellow'] as const;

export const CreateTrackerScreen = () => {
  const navigation = useNavigation();
  const addTracker = useTrackerStore((state) => state.addTracker);
  const today = startOfDay(new Date());

  // --- STATE ---
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TrackerType>('HABIT');
  const [selectedColor, setSelectedColor] = useState<string>('today');

  // Sync State: Date <-> Days
  const [endDate, setEndDate] = useState(addDays(today, 21)); // Default +21 days
  const [daysInput, setDaysInput] = useState('21');

  // Toggles
  const [isInfinite, setIsInfinite] = useState(false); //  HABIT
  const [isCountDown, setIsCountDown] = useState(false); //  EVENT

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // --- SYNC LOGIC ---

  const handleDaysChange = (text: string) => {
    setDaysInput(text);
    const days = parseInt(text);
    if (!isNaN(days) && days >= 0) {
      const newDate = addDays(today, days);
      setEndDate(newDate);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setEndDate(date);
    const daysDiff = differenceInCalendarDays(date, today);
    setDaysInput(daysDiff.toString());
    setShowDatePicker(false);
  };

  // --- HANDLERS ---

  const handleCreate = () => {
    if (!title.trim()) return;

    const config: any = {};

    if (type === 'HABIT') {
      config.goalEnabled = !isInfinite; // If it is NOT infinite, then the target is enabled.
      if (!isInfinite) {
        config.endDate = endDate;
        config.targetDays = parseInt(daysInput) || 0;
      }
    } else {
      // EVENT
      config.endDate = endDate;
      config.isCountDown = isCountDown;
      config.targetDays = parseInt(daysInput) || 0;
      config.goalEnabled = true;
    }

    addTracker(title, type, selectedColor, config);
    navigation.goBack();
  };

  const openDatePicker = () => {
    setTempDate(endDate);
    setShowDatePicker(true);
  };

  const onDateChangeIOS = (event: any, selectedDate?: Date) => {
    if (selectedDate) setTempDate(selectedDate);
  };

  const onDateChangeAndroid = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) handleDateConfirm(selectedDate);
  };

  // --- PREVIEW ---
  const PreviewCard = () => {
    const gradient = colors.gradients[selectedColor as keyof typeof colors.gradients] || colors.gradients.today;

    let subText = "";
    if (type === 'HABIT') {
      if (isInfinite) subText = "Build indefinitely";
      else subText = `Goal: ${daysInput} days`;
    } else {
      subText = isCountDown ? `${daysInput} days left` : `${daysInput} days passed`;
    }

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>PREVIEW</Text>
        <View style={styles.cardMock}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{title || "Tracker Name..."}</Text>
            <View style={styles.cardStats}>
              {type === 'HABIT' ? (
                <>
                  <Flame size={14} color={gradient[0]} fill={gradient[0]} />
                  <Text style={[styles.cardSub, { color: colors.text.secondary }]}>0 streak</Text>
                </>
              ) : (
                <>
                  {isCountDown ? <ArrowDownCircle size={14} color={gradient[0]} /> : <ArrowUpCircle size={14} color={gradient[0]} />}
                  <Text style={[styles.cardSub, { color: colors.text.secondary }]}>
                    {isCountDown ? "Target Date" : "Since Date"}
                  </Text>
                </>
              )}
            </View>
            <Text style={{color: colors.text.dim, fontSize: 11, marginTop: 4}}>{subText}</Text>
          </View>
          <View style={styles.cardRight}>
            {type === 'HABIT' ? (
              <View style={[styles.checkMock, { borderColor: gradient[1] }]}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: gradient[0] }} />
              </View>
            ) : (
              <Text style={[styles.daysBig, { color: gradient[0] }]}>
                {daysInput}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Determine if inputs are blocked
  const inputsDisabled = type === 'HABIT' && isInfinite;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Tracker</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <X color={colors.text.secondary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <PreviewCard />

          {/* NAME */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder={type === 'HABIT' ? "e.g. Gym, Reading" : "e.g. Project Launch"}
            placeholderTextColor={colors.text.dim}
            value={title}
            onChangeText={setTitle}
          />

          {/* TYPE */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'HABIT' && styles.typeButtonActive]}
              onPress={() => setType('HABIT')}
            >
              <Text style={[styles.typeText, type === 'HABIT' && styles.typeTextActive]}>Habit</Text>
              <Text style={styles.typeSub}>Repeat & Streak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'EVENT' && styles.typeButtonActive]}
              onPress={() => setType('EVENT')}
            >
              <Text style={[styles.typeText, type === 'EVENT' && styles.typeTextActive]}>Event</Text>
              <Text style={styles.typeSub}>One-time & Date</Text>
            </TouchableOpacity>
          </View>

          {/* --- UNIFIED SETTINGS (DATE & DAYS) --- */}
          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <Text style={styles.labelNoMargin}>
                {type === 'HABIT' ? 'Goal Duration' : 'Target Date'}
              </Text>

              {/* SWITCHES RIGHT IN THE HEADER */}
              {type === 'HABIT' && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchSmallText}>Infinite</Text>
                  <Switch
                    trackColor={{ false: '#333', true: colors.gradients.today[1] }}
                    thumbColor={'#fff'}
                    ios_backgroundColor="#333"
                    onValueChange={setIsInfinite}
                    value={isInfinite}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              )}
              {type === 'EVENT' && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchSmallText}>Countdown</Text>
                  <Switch
                    trackColor={{ false: '#333', true: colors.gradients.future[1] }}
                    thumbColor={'#fff'}
                    ios_backgroundColor="#333"
                    onValueChange={setIsCountDown}
                    value={isCountDown}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              )}
            </View>

            {/* SYNCED INPUT ROW */}
            <View style={[styles.syncRow, inputsDisabled && styles.disabledRow]}>

              {/* Left: Date Button */}
              <TouchableOpacity
                style={styles.dateFlexButton}
                onPress={openDatePicker}
                disabled={inputsDisabled}
              >
                {inputsDisabled ? (
                  <Infinity size={24} color={colors.text.dim} />
                ) : (
                  <>
                    <CalendarIcon color={colors.gradients.today[0]} size={20} />
                    <Text style={styles.dateText}>{format(endDate, 'MMM dd, yyyy')}</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Right: Days Input */}
              <View style={styles.daysInputContainer}>
                {inputsDisabled ? (
                  <Infinity size={24} color={colors.text.dim} />
                ) : (
                  <>
                    <TextInput
                      style={styles.daysInput}
                      value={daysInput}
                      onChangeText={handleDaysChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.text.dim}
                    />
                    <Text style={styles.daysSuffix}>days</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* COLORS */}
          <Text style={styles.label}>Theme Color</Text>
          <View style={styles.colorsGrid}>
            {COLOR_OPTIONS.map((colorKey) => {
              const gradient = colors.gradients[colorKey as keyof typeof colors.gradients];
              const isSelected = selectedColor === colorKey;
              return (
                <TouchableOpacity key={colorKey} onPress={() => setSelectedColor(colorKey)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={gradient as any}
                    style={[styles.colorCircle, isSelected && styles.colorCircleSelected]}
                  >
                    {isSelected && <Check color="#fff" size={16} strokeWidth={3} />}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleCreate} disabled={!title.trim()} activeOpacity={0.8}>
            <LinearGradient
              colors={title.trim() ? colors.gradients[selectedColor as keyof typeof colors.gradients] || colors.gradients.today : ['#333', '#333']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>
                {type === 'HABIT' ? 'Start Habit' : 'Track Event'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* MODAL DATE PICKER (IOS) */}
        {Platform.OS === 'ios' && (
          <Modal transparent visible={showDatePicker} animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChangeIOS}
                  themeVariant="dark"
                  textColor="#fff"
                  minimumDate={today}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.modalBtnCancel}>
                    <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDateConfirm(tempDate)} style={styles.modalBtnConfirm}>
                    <Text style={styles.modalBtnTextConfirm}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* ANDROID DATE PICKER */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker value={endDate} mode="date" display="default" onChange={onDateChangeAndroid} minimumDate={today} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.borders.past },
  headerTitle: { color: colors.text.primary, fontSize: 20, fontWeight: '700' },
  closeButton: { padding: 4 },
  content: { padding: 20, paddingBottom: 40 },

  previewContainer: { marginBottom: 24, alignItems: 'center' },
  previewLabel: { color: colors.text.dim, fontSize: 10, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  cardMock: { width: '100%', backgroundColor: 'rgba(20, 25, 30, 0.6)', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.borders.past },
  cardInfo: { flex: 1 },
  cardTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardSub: { fontSize: 13 },
  cardRight: { alignItems: 'flex-end' },
  checkMock: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  daysBig: { fontSize: 24, fontWeight: '800' },

  label: { color: colors.text.secondary, fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 24, textTransform: 'uppercase', letterSpacing: 0.5 },
  labelNoMargin: { color: colors.text.secondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 12, padding: 16, color: colors.text.primary, fontSize: 16 },

  typeRow: { flexDirection: 'row', gap: 12 },
  typeButton: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.borders.past, backgroundColor: '#0F0F12' },
  typeButtonActive: { borderColor: colors.gradients.today[1], backgroundColor: 'rgba(0, 210, 255, 0.05)' },
  typeText: { color: colors.text.secondary, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  typeTextActive: { color: colors.text.primary },
  typeSub: { color: colors.text.dim, fontSize: 12 },

  // --- UNIFIED ROW STYLES ---
  section: { marginTop: 24 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchSmallText: { color: colors.text.dim, fontSize: 12 },

  syncRow: { flexDirection: 'row', gap: 12 },
  disabledRow: { opacity: 0.3 },

  dateFlexButton: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 12, paddingHorizontal: 16, height: 56 },
  dateText: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },

  daysInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 12, paddingHorizontal: 16, height: 56 },
  daysInput: { flex: 1, color: colors.text.primary, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  daysSuffix: { color: colors.text.dim, fontSize: 12, marginLeft: 4 },

  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'flex-start' },
  colorCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', opacity: 0.6 },
  colorCircleSelected: { opacity: 1, borderWidth: 2, borderColor: '#fff', transform: [{ scale: 1.1 }] },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.borders.past, backgroundColor: colors.background },
  createButton: { padding: 18, borderRadius: 16, alignItems: 'center' },
  createButtonText: { color: colors.text.inverse, fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.borders.past },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#333', alignItems: 'center' },
  modalBtnConfirm: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.gradients.today[1], alignItems: 'center' },
  modalBtnTextCancel: { color: colors.text.primary, fontWeight: '600' },
  modalBtnTextConfirm: { color: '#000', fontWeight: '700' },
});
