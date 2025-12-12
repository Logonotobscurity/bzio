"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserActivity {
  id: string;
  type: 'quote_request' | 'product_view' | 'purchase' | 'profile_update' | 'search';
  title: string;
  description: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

interface ActivityState {
  activities: UserActivity[];
  addActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;
  getActivities: (limit?: number) => UserActivity[];
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      addActivity: (activity) => {
        const newActivity: UserActivity = {
          ...activity,
          id: `activity-${Date.now()}`,
          timestamp: new Date(),
        };
        set((state) => ({
          activities: [newActivity, ...state.activities],
        }));
      },
      getActivities: (limit = 50) => {
        return get().activities.slice(0, limit);
      },
      clearActivities: () => {
        set({ activities: [] });
      },
    }),
    {
      name: 'activity-storage',
    }
  )
);

// Initialize with mock activities
export function initializeMockActivities() {
  const store = useActivityStore.getState();
  
  // Check if activities already exist to prevent duplicates
  if (store.activities.length > 0) {
    return;
  }
  
  // Add some mock activities
  const mockActivities: Omit<UserActivity, 'id' | 'timestamp'>[] = [
    {
      type: 'quote_request',
      title: 'Quote Request Submitted',
      description: 'Submitted a quote request for Rice (50kg bags)',
      details: { items: 5, value: '₦500,000' },
    },
    {
      type: 'product_view',
      title: 'Viewed Product',
      description: 'Viewed Golden Parrot Rice product details',
      details: { productId: 'rice-001' },
    },
    {
      type: 'quote_request',
      title: 'Quote Request Submitted',
      description: 'Submitted a quote request for Cooking Oil (5L bottles)',
      details: { items: 10, value: '₦200,000' },
    },
    {
      type: 'product_view',
      title: 'Viewed Product',
      description: 'Viewed Premium Vegetable Oil product details',
      details: { productId: 'oil-001' },
    },
    {
      type: 'search',
      title: 'Product Search',
      description: 'Searched for "Rice varieties"',
      details: { query: 'Rice varieties', results: 12 },
    },
    {
      type: 'quote_request',
      title: 'Quote Request Submitted',
      description: 'Submitted a quote request for Sugar (25kg bags)',
      details: { items: 3, value: '₦150,000' },
    },
    {
      type: 'product_view',
      title: 'Viewed Product',
      description: 'Viewed Sweet Life Sugar product details',
      details: { productId: 'sugar-001' },
    },
  ];

  // Create activity objects with proper timestamps
  const now = new Date();
  const activitiesWithTimestamp: UserActivity[] = mockActivities.map((activity, index) => {
    const timestamp = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)); // Each activity 1 day apart
    return {
      ...activity,
      id: `activity-${Date.now()}-${index}`,
      timestamp,
    };
  });

  // Reverse to get newest first
  activitiesWithTimestamp.reverse();

  // Update store with all activities at once
  useActivityStore.setState({ activities: activitiesWithTimestamp });
}
