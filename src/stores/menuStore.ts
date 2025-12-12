import { create } from 'zustand';

interface MenuStore {
  isMenuOpen: boolean;
  isSubmenuOpen: { [key: string]: boolean };
  toggleMenu: () => void;
  closeMenu: () => void;
  openMenu: () => void;
  toggleSubmenu: (key: string) => void;
  closeSubmenu: (key: string) => void;
  closeAllSubmenus: () => void;
}

/**
 * Mobile Menu Store
 * Manages global mobile menu state with submenu support
 */
export const useMenuStore = create<MenuStore>((set) => ({
  isMenuOpen: false,
  isSubmenuOpen: {},
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  
  closeMenu: () => set({ isMenuOpen: false, isSubmenuOpen: {} }),
  
  openMenu: () => set({ isMenuOpen: true }),
  
  toggleSubmenu: (key: string) => 
    set((state) => ({
      isSubmenuOpen: {
        ...state.isSubmenuOpen,
        [key]: !state.isSubmenuOpen[key],
      },
    })),
  
  closeSubmenu: (key: string) =>
    set((state) => ({
      isSubmenuOpen: {
        ...state.isSubmenuOpen,
        [key]: false,
      },
    })),
  
  closeAllSubmenus: () => set({ isSubmenuOpen: {} }),
}));
