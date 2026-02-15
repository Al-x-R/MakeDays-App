import React from 'react';
import { View, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { TrackerCard } from '../components/TrackerCard';
import colors from '../constants/colors';
import { useTrackerStore } from '../store/useTrackerStore';
import { format } from 'date-fns';

export const ListScreen = ({ navigation }: any) => {
  const { trackers, toggleDay } = useTrackerStore();

  const today = format(new Date(), 'yyyy-MM-dd'); // "2026-02-15"

  const calculateStreak = (history: Record<string, boolean>) => {
    return Object.keys(history).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <ScrollView contentContainerStyle={styles.scroll}>
        {trackers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No trackers yet.</Text>
            <Text style={styles.emptySubText}>Press (+) to create one.</Text>
          </View>
        ) : (
          trackers.map((t) => (
            <TrackerCard
              key={t.id}
              id={t.id}
              title={t.title}
              type={t.type}
              streak={calculateStreak(t.history)}
              todayCompleted={!!t.history[today]}
              onPress={() => navigation.navigate('TrackerDetail', { trackerId: t.id, title: t.title })}
              onCheck={() => toggleDay(t.id, today)}
            />
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: 18, fontWeight: '600' },
  emptySubText: { color: colors.text.dim, marginTop: 8 },
});
