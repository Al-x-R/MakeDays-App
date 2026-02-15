import React from 'react';
import { StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { YearGrid } from '../components/YearGrid';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CalendarScreen = () => (
<SafeAreaView style={styles.container} edges={[ 'top', 'left', 'right']}>
  <Header />
  <YearGrid />
</SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  text: { color: colors.text.primary },
});
