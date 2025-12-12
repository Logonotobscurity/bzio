import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  compactMode: boolean;
}

interface PreferencesStore extends UserPreferences {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: true,
  compactMode: false,
};

/**
 * User Preferences Store
 * Manages user preferences with localStorage persistence
 */
export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        // Apply theme to document
        if (theme !== 'system') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      
      setLanguage: (language: string) => set({ language }),
      
      setNotifications: (notifications: boolean) => set({ notifications }),
      
      setCompactMode: (compactMode: boolean) => set({ compactMode }),
      
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'user-preferences',
    }
  )
);
