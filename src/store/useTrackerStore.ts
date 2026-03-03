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

  editTracker: (
    id: string,
    updates: Partial<Tracker>
  ) => void;

  deleteTracker: (id: string) => void;
  toggleDay: (trackerId: string, date: string) => void;
  finishTracker: (id: string) => void;
  clearAll: () => void;
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
              goal: {
                enabled: config?.goalEnabled ?? false,
                targetValue: config?.targetDays
              }
            },
          ],
        }));
      },

      editTracker: (id, updates) => set((state) => ({
        trackers: state.trackers.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),

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

      finishTracker: (id) => set((state) => ({
        trackers: state.trackers.map((t) =>
          t.id === id ? { ...t, endDate: new Date().toISOString() } : t
        )
      })),

      clearAll: () => set({ trackers: [] }),
    }),
    {
      name: 'tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
