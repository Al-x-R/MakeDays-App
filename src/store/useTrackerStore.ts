import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Tracker {
  id: string;
  title: string;
  type: 'FATE' | 'WILL';
  color?: string;
  history: Record<string, boolean>;
  createdAt: string;
}

interface TrackerState {
  trackers: Tracker[];

  // Actions
  addTracker: (title: string, type: 'FATE' | 'WILL', color?: string) => void;
  deleteTracker: (id: string) => void;
  toggleDay: (trackerId: string, date: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      trackers: [],

      addTracker: (title, type, color) => set((state) => ({
        trackers: [
          ...state.trackers,
          {
            id: Date.now().toString(),
            title,
            type,
            color,
            history: {},
            createdAt: new Date().toISOString(),
          },
        ],
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
    }),
    {
      name: 'tracker-storage', // Name of the key in the phone memory
      storage: createJSONStorage(() => AsyncStorage), // Using AsyncStorage
    }
  )
);
