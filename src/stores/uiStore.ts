import { create } from 'zustand';

export interface UIStore {
  // Navigation
  isMobileMenuOpen: boolean;
  activeDropdown: string | null;
  
  // Carousel
  activeSlide: number;
  isAutoPlaying: boolean;
  
  // Search
  searchQuery: string;
  isSearchOpen: boolean;
  
  // Actions
  toggleMobileMenu: () => void;
  setActiveDropdown: (id: string | null) => void;
  setActiveSlide: (index: number) => void;
  toggleAutoPlay: () => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  isMobileMenuOpen: false,
  activeDropdown: null,
  activeSlide: 0,
  isAutoPlaying: true,
  searchQuery: '',
  isSearchOpen: false,

  // Actions
  toggleMobileMenu: () =>
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    })),

  setActiveDropdown: (id: string | null) =>
    set({
      activeDropdown: id,
    }),

  setActiveSlide: (index: number) =>
    set({
      activeSlide: index,
    }),

  toggleAutoPlay: () =>
    set((state) => ({
      isAutoPlaying: !state.isAutoPlaying,
    })),

  setSearchQuery: (query: string) =>
    set({
      searchQuery: query,
    }),

  toggleSearch: () =>
    set((state) => ({
      isSearchOpen: !state.isSearchOpen,
    })),
}));
