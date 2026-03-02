import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';

const AVAILABLE_COLORS = ['today', 'purple', 'orange', 'green', 'red'];
const AVAILABLE_ICONS = ['Activity', 'Heart', 'Star', 'Flame', 'Target', 'Coffee', 'Book'];

export const EditTrackerScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const id = route.params?.id;

  const tracker = useTrackerStore((state) => state.trackers.find((t) => t.id === id));
  const editTracker = useTrackerStore((state) => state.editTracker);

  const [title, setTitle] = useState(tracker?.title || '');
  const [description, setDescription] = useState(tracker?.description || '');
  const [color, setColor] = useState(tracker?.color || 'today');
  const [icon, setIcon] = useState(tracker?.icon || 'Activity');
  const [isCountDown, setIsCountDown] = useState(tracker?.isCountDown || false);

  const [startDate, setStartDate] = useState(tracker?.startDate);
  const [endDate, setEndDate] = useState(tracker?.endDate);

  if (!tracker) return null;

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название');
      return;
    }

    editTracker(tracker.id, {
      title,
      description,
      color,
      icon,
      isCountDown,
      // startDate,
      // endDate,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEDER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактирование</Text>
        <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
          <Check color={colors.gradients.green[0]} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* NAME & DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Название</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Название трекера"
            placeholderTextColor={colors.text.dim}
          />

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Описание (необязательно)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Пара слов для мотивации..."
            placeholderTextColor={colors.text.dim}
            multiline
          />
        </View>

        {/* SETTINGS FOR EVENTS */}
        {tracker.type === 'EVENT' && (
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Обратный отсчет</Text>
                <Text style={styles.switchSubLabel}>Отображать как оставшиеся дни</Text>
              </View>
              <Switch
                value={isCountDown}
                onValueChange={setIsCountDown}
                trackColor={{ false: '#333', true: colors.gradients[color as keyof typeof colors.gradients][0] }}
              />
            </View>
          </View>
        )}

        {/* COLOR */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Цвет</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowList}>
            {AVAILABLE_COLORS.map((c) => {
              const grad = colors.gradients[c as keyof typeof colors.gradients];
              const isSelected = color === c;
              return (
                <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorCircle, { backgroundColor: grad[0], borderWidth: isSelected ? 3 : 0, borderColor: '#fff' }]} />
              );
            })}
          </ScrollView>
        </View>

        {/* ICON */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Иконка</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowList}>
            {AVAILABLE_ICONS.map((i) => {
              const IconComp = (Icons as any)[i];
              const isSelected = icon === i;
              return (
                <TouchableOpacity key={i} onPress={() => setIcon(i)} style={[styles.iconCircle, isSelected && { backgroundColor: `${colors.gradients[color as keyof typeof colors.gradients][0]}40` }]}>
                  <IconComp size={24} color={isSelected ? colors.gradients[color as keyof typeof colors.gradients][0] : colors.text.secondary} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DATES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Даты (скоро)</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => Alert.alert('Даты', 'Тут будет вызов DatePicker')}>
              <Text style={styles.dateLabel}>Старт</Text>
              <Text style={styles.dateValue}>{startDate ? format(new Date(startDate), 'dd MMM yyyy', { locale: ru }) : 'Не задано'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateButton} onPress={() => Alert.alert('Даты', 'Тут будет вызов DatePicker')}>
              <Text style={styles.dateLabel}>Финиш</Text>
              <Text style={styles.dateValue}>{endDate ? format(new Date(endDate), 'dd MMM yyyy', { locale: ru }) : 'Бесконечно'}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
  sectionLabel: { color: colors.text.dim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

  input: { backgroundColor: '#1A1A1E', borderRadius: 16, padding: 16, color: colors.text.primary, fontSize: 16, borderWidth: 1, borderColor: colors.borders.past },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1E', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borders.past },
  switchLabel: { color: colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  switchSubLabel: { color: colors.text.dim, fontSize: 13 },

  rowList: { gap: 16 },
  colorCircle: { width: 44, height: 44, borderRadius: 22 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A1A1E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.borders.past },

  dateRow: { flexDirection: 'row', gap: 12 },
  dateButton: { flex: 1, backgroundColor: '#1A1A1E', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borders.past },
  dateLabel: { color: colors.text.dim, fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  dateValue: { color: colors.text.primary, fontSize: 15, fontWeight: '600' }
});
