import React from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { TrackerCard } from '../components/TrackerCard';
import colors from '../constants/colors';

export const ListScreen = () => {
  const trackers = [
    { id: '1', title: 'Жизнь (2026)', type: 'FATE' as const, streak: 45 },
    { id: '2', title: 'Gym Workout', type: 'WILL' as const, streak: 3, done: true },
    { id: '3', title: 'React Native', type: 'WILL' as const, streak: 12, done: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.scroll}>
        {trackers.map((t) => (
          <TrackerCard
            key={t.id}
            id={t.id}
            title={t.title}
            type={t.type}
            streak={t.streak}
            todayCompleted={t.done}
            onPress={() => Alert.alert('Navigate', `Go to grid: ${t.title}`)}
            onCheck={() => Alert.alert('Check', 'Done!')}
          />
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
});
