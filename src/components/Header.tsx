// src/components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
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
      padding: 8,
      backgroundColor: `${colors.gradients.today[1]}1A`,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: `${colors.gradients.today[1]}4D`,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
