import React from 'react';
import { StyleSheet } from 'react-native';
import { YearGrid } from '../components/YearGrid';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

export const CalendarScreen = () => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header />
      <YearGrid />
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    text: { color: colors.text.primary },
  });
