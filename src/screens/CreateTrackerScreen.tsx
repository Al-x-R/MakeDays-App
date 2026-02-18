import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Switch, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Calendar as CalendarIcon, Infinity, Hammer, Ban } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';
import { TrackerType } from '../types';
import { PreviewCard } from '../components/PreviewCard';

const COLOR_OPTIONS = ['today', 'purple', 'green', 'orange', 'red', 'pink', 'blue', 'yellow'] as const;

export const CreateTrackerScreen = () => {
  const navigation = useNavigation();
  const addTracker = useTrackerStore((state) => state.addTracker);
  const today = startOfDay(new Date());

  // --- STATE ---
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TrackerType>('HABIT');
  const [habitBehavior, setHabitBehavior] = useState<'DO' | 'QUIT'>('DO'); // Новое состояние
  const [selectedColor, setSelectedColor] = useState<string>('today');

  const [endDate, setEndDate] = useState(addDays(today, 21));
  const [daysInput, setDaysInput] = useState('21');

  const [isInfinite, setIsInfinite] = useState(false);
  const [isCountDown, setIsCountDown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // --- HANDLERS ---
  const handleDaysChange = (text: string) => {
    setDaysInput(text);
    const days = parseInt(text);
    if (!isNaN(days) && days >= 0) setEndDate(addDays(today, days));
  };

  const handleDateConfirm = (date: Date) => {
    setEndDate(date);
    setDaysInput(differenceInCalendarDays(date, today).toString());
    setShowDatePicker(false);
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    const config: any = {};
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

          <PreviewCard
            title={title} type={type} color={selectedColor}
            daysInput={daysInput} isInfinite={isInfinite} isCountDown={isCountDown}
            behavior={habitBehavior} // Передаем поведение в превью
          />

          {/* NAME */}
          <View style={styles.compactRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.inputCompact}
              placeholder="Tracker Name"
              placeholderTextColor={colors.text.dim}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* TYPE SELECTOR */}
          <View style={styles.compactRow}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.selectBtn, type === 'HABIT' && styles.selectBtnActive]}
                onPress={() => setType('HABIT')}
              >
                <Text style={[styles.selectBtnText, type === 'HABIT' && styles.selectBtnTextActive]}>Habit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectBtn, type === 'EVENT' && styles.selectBtnActive]}
                onPress={() => setType('EVENT')}
              >
                <Text style={[styles.selectBtnText, type === 'EVENT' && styles.selectBtnTextActive]}>Event</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* MODE SELECTOR (Только для Habit) */}
          {type === 'HABIT' && (
            <View style={styles.compactRow}>
              <Text style={styles.label}>Mode</Text>
              <View style={styles.row}>
                {/* Build Button */}
                <TouchableOpacity
                  style={[styles.modeBtn, habitBehavior === 'DO' && styles.modeBtnActive]}
                  onPress={() => setHabitBehavior('DO')}
                >
                  <Hammer size={16} color={habitBehavior === 'DO' ? colors.text.primary : colors.text.dim} />
                  <View>
                    <Text style={[styles.modeTitle, habitBehavior === 'DO' && styles.modeTitleActive]}>Build</Text>
                    <Text style={styles.modeSub}>Check-in</Text>
                  </View>
                </TouchableOpacity>

                {/* Quit Button */}
                <TouchableOpacity
                  style={[styles.modeBtn, habitBehavior === 'QUIT' && styles.modeBtnQuitActive]}
                  onPress={() => setHabitBehavior('QUIT')}
                >
                  <Ban size={16} color={habitBehavior === 'QUIT' ? colors.gradients.red[0] : colors.text.dim} />
                  <View>
                    <Text style={[styles.modeTitle, habitBehavior === 'QUIT' && styles.modeTitleActive]}>Quit</Text>
                    <Text style={styles.modeSub}>Don't do it</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SETTINGS (Goal / Target) */}
          <View style={styles.compactSection}>
            <View style={styles.rowHeader}>
              <Text style={styles.label}>{type === 'HABIT' ? 'Goal' : 'Target'}</Text>

              {type === 'HABIT' && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>Infinite</Text>
                  <Switch value={isInfinite} onValueChange={setIsInfinite} trackColor={{false:'#333', true:colors.gradients.today[1]}} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                </View>
              )}
              {type === 'EVENT' && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>Timer</Text>
                  <Switch value={isCountDown} onValueChange={setIsCountDown} trackColor={{false:'#333', true:colors.gradients.future[1]}} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                </View>
              )}
            </View>

            <View style={[styles.syncRow, inputsDisabled && { opacity: 0.3 }]}>
              <TouchableOpacity style={styles.dateBtn} onPress={() => { setTempDate(endDate); setShowDatePicker(true); }} disabled={inputsDisabled}>
                {inputsDisabled ? <Infinity size={20} color={colors.text.dim} /> : <><CalendarIcon color={colors.gradients.today[0]} size={18} /><Text style={styles.dateText}>{format(endDate, 'MMM dd')}</Text></>}
              </TouchableOpacity>
              <View style={styles.daysContainer}>
                {inputsDisabled ? <Infinity size={20} color={colors.text.dim} /> : <><TextInput style={styles.daysInput} value={daysInput} onChangeText={handleDaysChange} keyboardType="numeric" /><Text style={styles.daysSuffix}>d</Text></>}
              </View>
            </View>
          </View>

          {/* COLORS */}
          <Text style={[styles.label, { marginTop: 8 }]}>Color</Text>
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
                {type === 'HABIT' ? (habitBehavior === 'QUIT' ? 'Start Quitting' : 'Start Habit') : 'Track Event'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* MODALS */}
        {Platform.OS === 'ios' && (
          <Modal transparent visible={showDatePicker} animationType="fade">
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <DateTimePicker value={tempDate} mode="date" display="spinner" onChange={(e,d) => d && setTempDate(d)} themeVariant="dark" textColor="#fff" minimumDate={today} />
              <View style={styles.modalButtons}><TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.btnCancel}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={() => handleDateConfirm(tempDate)} style={styles.btnConfirm}><Text style={styles.btnTextBold}>Confirm</Text></TouchableOpacity></View>
            </View></View>
          </Modal>
        )}
        {Platform.OS === 'android' && showDatePicker && <DateTimePicker value={endDate} mode="date" display="default" onChange={(e,d) => { setShowDatePicker(false); if(d) handleDateConfirm(d); }} minimumDate={today} />}
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

  label: { color: colors.text.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  inputCompact: { backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 8, padding: 12, color: colors.text.primary, fontSize: 16 },

  compactRow: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },

  // TYPE BUTTONS
  selectBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.borders.past, backgroundColor: '#0F0F12', alignItems: 'center' },
  selectBtnActive: { borderColor: colors.gradients.today[1], backgroundColor: 'rgba(0, 210, 255, 0.05)' },
  selectBtnText: { color: colors.text.secondary, fontWeight: '600', fontSize: 14 },
  selectBtnTextActive: { color: colors.text.primary },

  // MODE BUTTONS (COMPACT & ROW)
  modeBtn: {
    flex: 1,
    flexDirection: 'row', // В ряд!
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borders.past,
    backgroundColor: '#0F0F12'
  },
  modeBtnActive: { borderColor: colors.gradients.today[1], backgroundColor: 'rgba(0, 210, 255, 0.05)' },
  modeBtnQuitActive: { borderColor: colors.gradients.red[1], backgroundColor: 'rgba(255, 69, 58, 0.05)' },

  modeTitle: { color: colors.text.secondary, fontWeight: '700', fontSize: 13 },
  modeTitleActive: { color: colors.text.primary },
  modeSub: { color: colors.text.dim, fontSize: 10 },

  compactSection: { marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchText: { color: colors.text.dim, fontSize: 11 },

  syncRow: { flexDirection: 'row', gap: 8 },
  dateBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 8, paddingHorizontal: 12, height: 44 },
  dateText: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  daysContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: colors.borders.past, borderRadius: 8, paddingHorizontal: 12, height: 44 },
  daysInput: { flex: 1, color: colors.text.primary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  daysSuffix: { color: colors.text.dim, fontSize: 12 },

  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  colorCircleSelected: { opacity: 1, borderWidth: 2, borderColor: '#fff' },

  footer: { padding: 16, borderTopWidth: 1, borderColor: colors.borders.past, backgroundColor: colors.background },
  createButton: { padding: 14, borderRadius: 12, alignItems: 'center' },
  createButtonText: { color: colors.text.inverse, fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: colors.gradients.today[1], alignItems: 'center' },
  btnText: { color: '#fff' },
  btnTextBold: { color: '#000', fontWeight: '700' },
});
