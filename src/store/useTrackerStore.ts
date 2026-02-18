import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Tracker, TrackerType } from '../types';

interface TrackerState {
  trackers: Tracker[];

  addTracker: (
    title: string,
    type: TrackerType,
    color: string,
    config?: {
      description?: string;
      icon?: string;
      startDate?: Date;
      endDate?: Date;
      isCountDown?: boolean;
      goalEnabled?: boolean;
      targetDays?: number;
      behavior?: 'DO' | 'QUIT';
    }
  ) => void;

  deleteTracker: (id: string) => void;
  toggleDay: (trackerId: string, date: string) => void;
  resetTracker: (trackerId: string, date: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      trackers: [],

      addTracker: (title, type, color, config) => {
        set((state) => ({
          trackers: [
            ...state.trackers,
            {
              id: Date.now().toString(),
              title,
              description: config?.description,
              icon: config?.icon || 'Activity',
              startDate: config?.startDate?.toISOString() || new Date().toISOString(),
              type,
              color,
              history: {},
              createdAt: new Date().toISOString(),
              endDate: config?.endDate?.toISOString(),
              isCountDown: config?.isCountDown,
              behavior: config?.behavior || 'DO',
              lastResetDate: config?.behavior === 'QUIT' ? new Date().toISOString() : undefined,
              goal: {
                enabled: config?.goalEnabled ?? false,
                targetValue: config?.targetDays
              }
            },
          ],
        }));
      },

      deleteTracker: (id) => set((state) => ({
        trackers: state.trackers.filter((t) => t.id !== id),
      })),

      toggleDay: (trackerId, date) => set((state) => ({
        trackers: state.trackers.map((t) => {
          if (t.id !== trackerId) return t;

          const newHistory = { ...t.history };
          if (newHistory[date]) {
            delete newHistory[date];
          } else {
            newHistory[date] = true;
          }

          return { ...t, history: newHistory };
        }),
      })),

      resetTracker: (trackerId, date) => set((state) => ({
        trackers: state.trackers.map((t) => {
          if (t.id !== trackerId) return t;

          return {
            ...t,
            lastResetDate: new Date().toISOString(),
            history: { ...t.history, [date]: false }
          };
        }),
      })),
    }),
    {
      name: 'tracker-storage', // Name of the key in the phone memory
      storage: createJSONStorage(() => AsyncStorage), // Using AsyncStorage
    }
  )
);
