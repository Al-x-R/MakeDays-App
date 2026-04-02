// src/components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../constants/colors';
import { User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const displayTitle = title ?? t('header.title');
  const displaySubtitle = subtitle ?? t('header.subtitle');

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <User color={colors.text.primary} size={20} />
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
    letterSpacing: 0.5
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    opacity: 0.7
  },
  button: {
    padding: 8,
    backgroundColor: 'rgba(51, 181, 229, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(51, 181, 229, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
