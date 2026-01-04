/**
 * Store Types
 * 
 * Zustand and client-side state management types
 * These define the shape of client state stores
 */

// ===== UI STORE =====
export interface UIStore {
  isMobileMenuOpen: boolean;
  activeDropdown: string | null;
  activeSlide: number;
  isAutoPlaying: boolean;
  searchQuery: string;
  isSearchOpen: boolean;

  toggleMobileMenu: () => void;
  setActiveDropdown: (id: string | null) => void;
  setActiveSlide: (index: number) => void;
  toggleAutoPlay: () => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
}

// ===== CART STORE =====
export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  sku: string;
  imageUrl?: string;
  brand?: string;
  category?: string;
}

export interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// ===== QUOTE STORE =====
export interface QuoteItem {
  productId?: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice?: number;
  description?: string;
}

export interface QuoteState {
  items: QuoteItem[];
  buyerEmail: string;
  buyerPhone?: string;
  buyerCompanyId?: string;

  addItem: (item: QuoteItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: QuoteItem) => void;
  setBuyerInfo: (email: string, phone?: string, companyId?: string) => void;
  clearQuote: () => void;
  getTotal: () => number;
}

// ===== AUTH STORE =====
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  role?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// ===== MENU STORE =====
export interface MenuStore {
  isOpen: boolean;
  activeMenu: string | null;

  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  setActiveMenu: (menu: string | null) => void;
}

// ===== PREFERENCES STORE =====
export interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notifications: boolean;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
}

// ===== ACTIVITY STORE =====
export interface UserActivity {
  id: string;
  type: string;
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityState {
  activities: UserActivity[];
  isLoading: boolean;

  addActivity: (activity: UserActivity) => void;
  clearActivities: () => void;
  setLoading: (loading: boolean) => void;
}

// ===== PAGINATION STORE STATE =====
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  hasMore: boolean;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotal: (total: number) => void;
}

// ===== FILTER STATE =====
export interface FilterState {
  category?: string;
  brand?: string;
  priceRange?: { min: number; max: number };
  searchQuery?: string;
  sortBy?: string;

  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
}

// ===== MODAL/DIALOG STORE =====
export interface DialogState {
  openDialogs: Map<string, boolean>;
  dialogData: Map<string, unknown>;

  openDialog: (dialogId: string, data?: unknown) => void;
  closeDialog: (dialogId: string) => void;
  isDialogOpen: (dialogId: string) => boolean;
  getDialogData: (dialogId: string) => unknown;
}
