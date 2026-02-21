import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../constants/colors';
import { ChartColumn, LucideColumnsSettings } from 'lucide-react-native';
import { useNavigationState } from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onActionPress?: () => void;
}

export const Header = ({
  title,
  subtitle,
  onActionPress
}: HeaderProps) => {
  const { t } = useTranslation();
  const state = useNavigationState(state => state);
  const currentRouteName = state?.routes[state.index]?.name;
  const displayTitle = title ?? t('header.title');
  const displaySubtitle = subtitle ?? t('header.subtitle');

  const handlePress = () => {
    if (onActionPress) {
      onActionPress();
    } else {
      Alert.alert(t('header.historyAlertTitle'), t('header.historyAlertMessage'));
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {currentRouteName === 'Calendar' ? (
          <ChartColumn color={colors.text.primary} size={24} />
        ) : (
          <LucideColumnsSettings color={colors.text.primary} size={24} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(51, 181, 229, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 181, 229, 0.3)',
  },
  buttonText: {
    color: colors.gradients.future[0],
    fontSize: 12,
    fontWeight: '700',
  },
});
