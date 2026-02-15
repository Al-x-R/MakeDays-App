import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrackerStore } from '../store/useTrackerStore';
import colors from '../constants/colors';

// Доступные цвета для выбора (ключи из colors.gradients)
const COLOR_OPTIONS = [
  'today', // Cyan
  'purple',
  'green',
  'orange',
  'red',
  'pink',
  'blue',
  'yellow'
] as const;

export const CreateTrackerScreen = () => {
  const navigation = useNavigation();
  const addTracker = useTrackerStore((state) => state.addTracker);

  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('today');
  const [type, setType] = useState<'WILL' | 'FATE'>('WILL'); // По дефолту "Воля" (Привычка)

  const handleCreate = () => {
    if (!title.trim()) return; // Не создаем пустые

    // Вызываем экшен из Zustand
    addTracker(title, type, selectedColor);

    // Закрываем модалку
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Хедер модалки */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Habit</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <X color={colors.text.secondary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>

          {/* 1. Название */}
          <Text style={styles.label}>What do you want to track?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Gym, Read Books, No Sugar"
            placeholderTextColor={colors.text.dim}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* 2. Тип (пока просто кнопки, можно расширить) */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'WILL' && styles.typeButtonActive]}
              onPress={() => setType('WILL')}
            >
              <Text style={[styles.typeText, type === 'WILL' && styles.typeTextActive]}>Will (Habit)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, type === 'FATE' && styles.typeButtonActive]}
              onPress={() => setType('FATE')}
            >
              <Text style={[styles.typeText, type === 'FATE' && styles.typeTextActive]}>Fate (Event)</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Выбор цвета */}
          <Text style={styles.label}>Color Theme</Text>
          <View style={styles.colorsGrid}>
            {COLOR_OPTIONS.map((colorKey) => {
              const gradient = colors.gradients[colorKey as keyof typeof colors.gradients];
              const isSelected = selectedColor === colorKey;

              return (
                <TouchableOpacity
                  key={colorKey}
                  onPress={() => setSelectedColor(colorKey)}
                  activeOpacity={0.8}
                >
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

        {/* Кнопка Создать (внизу) */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={title.trim() ? colors.gradients.today : ['#333', '#333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButton}
            >
              <Text style={[
                styles.createButtonText,
                !title.trim() && { color: colors.text.dim }
              ]}>
                Start Tracking
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders.past,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: colors.borders.past,
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    fontSize: 18,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borders.past,
    alignItems: 'center',
    backgroundColor: '#111',
  },
  typeButtonActive: {
    borderColor: colors.gradients.today[1],
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  typeText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: colors.gradients.today[0],
    fontWeight: '700',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  colorCircleSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borders.past,
    backgroundColor: colors.background,
  },
  createButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
