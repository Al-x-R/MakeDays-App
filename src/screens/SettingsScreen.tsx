// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Moon, Info, User, X, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../hooks/useAppTheme';
import { useThemeStore } from '../store/useThemeStore';

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { colors, theme } = useAppTheme();
  const setTheme = useThemeStore((state) => state.setTheme);
  const styles = createStyles(colors, theme);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'language' | null;
  }>({ visible: false, type: null });

  const handleLanguageChange = (lang: 'ru' | 'en') => {
    i18n.changeLanguage(lang);
    setModalConfig({ visible: false, type: null });
  };

  const SettingRow = ({ icon: Icon, label, value, onPress, isDestructive = false, hasArrow = true, rightElement }: any) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, isDestructive && { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
        <Icon size={20} color={isDestructive ? colors.gradients.red[0] : colors.text.secondary} />
      </View>
      <Text style={[styles.settingLabel, isDestructive && { color: colors.gradients.red[0] }]}>
        {label}
      </Text>

      {value && <Text style={styles.settingValue}>{value}</Text>}
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      {hasArrow && !rightElement && <ChevronRight size={20} color={colors.text.dim} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <X color={colors.text.primary} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ЗАГЛУШКА ПРОФИЛЯ */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[`${colors.gradients.purple[0]}20`, `${colors.gradients.purple[0]}05`]}
            style={styles.avatarPlaceholder}
          >
            <User size={32} color={colors.gradients.purple[0]} />
          </LinearGradient>
          <View>
            <Text style={styles.profileName}>{t('settings.guest')}</Text>
            <Text style={styles.profileSub}>{t('settings.localMode')}</Text>
          </View>
        </View>

        {/* ОСНОВНЫЕ НАСТРОЙКИ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
          <View style={styles.card}>
            <SettingRow
              icon={Globe}
              label={t('settings.language')}
              value={i18n.language === 'ru' ? t('settings.languageRussian') : t('settings.languageEnglish')}
              onPress={() => setModalConfig({ visible: true, type: 'language' })}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={Moon}
              label={t('settings.theme')}
              hasArrow={false}
              rightElement={
                <Switch
                  value={theme === 'dark'}
                  onValueChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
                  trackColor={{ false: `${colors.gradients.today[0]}66`, true: colors.gradients.today[0] }}
                  thumbColor={colors.text.inverse}
                />
              }
            />
          </View>
        </View>

        {/* ИНФО */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow
              icon={Info}
              label={t('settings.about')}
              value="v1.0.0"
              hasArrow={false}
            />
          </View>
        </View>

      </ScrollView>

      <Modal visible={modalConfig.visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalConfig({ visible: false, type: null })}>
          <Pressable style={styles.modalContent}>

            {modalConfig.type === 'language' && (
              <>
                <Text style={styles.modalTitle}>{t('settings.language')}</Text>
                <Text style={styles.modalMessage}>{t('settings.selectLanguage')}</Text>

                <TouchableOpacity style={styles.modalButton} onPress={() => handleLanguageChange('ru')}>
                  <Text style={styles.modalButtonText}>{t('settings.languageRussian')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={() => handleLanguageChange('en')}>
                  <Text style={styles.modalButtonText}>{t('settings.languageEnglish')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setModalConfig({ visible: false, type: null })}>
                  <Text style={[styles.modalButtonText, { color: colors.text.dim }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </>
            )}

          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borders.past
  },
  headerTitle: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  closeButton: {
    padding: 8,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 23, 39, 0.06)',
    borderRadius: 12,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },

  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32, paddingHorizontal: 4 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: `${colors.gradients.purple[0]}40` },
  profileName: { color: colors.text.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  profileSub: { color: colors.text.dim, fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { marginBottom: 24 },
  sectionTitle: { color: colors.text.dim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.borders.past, overflow: 'hidden' },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 23, 39, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  settingLabel: { flex: 1, color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  settingValue: { color: colors.text.secondary, fontSize: 15, fontWeight: '500', marginRight: 8 },
  rightElement: { marginLeft: 8 },
  divider: { height: 1, backgroundColor: colors.borders.past, marginLeft: 64 },

  modalOverlay: { flex: 1, backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(10, 20, 45, 0.25)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 340, backgroundColor: colors.modalSurface, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: colors.borders.past },
  modalTitle: { color: colors.text.primary, fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  modalMessage: { color: colors.text.secondary, fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalButton: { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(16, 23, 39, 0.06)', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  modalCancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(16, 23, 39, 0.12)', marginTop: 4, marginBottom: 0 },
  modalButtonText: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
});
