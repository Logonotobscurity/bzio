"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Activity {
  id: string;
  type: 'quote' | 'purchase' | 'view' | 'search';
  title?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  getActivities: () => Activity[];
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      addActivity: (activity) =>
        set((state) => ({
          activities: [
            {
              ...activity,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date(),
            },
            ...state.activities,
          ],
        })),
      clearActivities: () => set({ activities: [] }),
      getActivities: () => get().activities,
    }),
    {
      name: 'activity-storage',
    }
  )
);

export function initializeMockActivities() {
  const store = useActivityStore.getState();
  const mockActivities: Omit<Activity, 'id' | 'timestamp'>[] = [
    {
      type: 'quote',
      description: 'Added Product A to quote',
    },
    {
      type: 'view',
      description: 'Viewed Product B details',
    },
    {
      type: 'search',
      description: 'Searched for "office supplies"',
    },
  ];

  mockActivities.forEach((activity) => {
    store.addActivity(activity);
  });
}
