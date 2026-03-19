import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Moon, Sun, Trash2, ChevronRight, Info, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import colors from '../constants/colors';

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();

  // --- ОБРАБОТЧИКИ ---

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      t('settings.selectLanguage'),
      [
        { text: t('settings.languageRussian'), onPress: () => i18n.changeLanguage('ru') },
        { text: t('settings.languageEnglish'), onPress: () => i18n.changeLanguage('en') },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ЗАГЛУШКА ПРОФИЛЯ  */}
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
              onPress={handleLanguageChange}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={Moon}
              label={t('settings.theme')}
              hasArrow={false}
              rightElement={
                <Switch
                  value={true} // Пока жестко включена
                  onValueChange={() => Alert.alert(t('settings.themeAlertTitle'), t('settings.themeAlertMessage'))}
                  trackColor={{ false: '#333', true: colors.gradients.today[0] }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borders.past },
  headerTitle: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32, paddingHorizontal: 4 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: `${colors.gradients.purple[0]}40` },
  profileName: { color: colors.text.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  profileSub: { color: colors.text.dim, fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { marginBottom: 24 },
  sectionTitle: { color: colors.text.dim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 16 },
  card: { backgroundColor: '#111', borderRadius: 20, borderWidth: 1, borderColor: colors.borders.past, overflow: 'hidden' },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingLabel: { flex: 1, color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  settingValue: { color: colors.text.secondary, fontSize: 15, fontWeight: '500', marginRight: 8 },
  rightElement: { marginLeft: 8 },
  divider: { height: 1, backgroundColor: colors.borders.past, marginLeft: 64 }, // Отступ под размер иконки
});
