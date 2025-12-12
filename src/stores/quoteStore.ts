import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
}

interface QuoteStore {
  items: QuoteItem[];
  addItem: (item: QuoteItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearQuote: () => void;
  getItemCount: () => number;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        if (state.items.some(i => i.id === item.id)) {
          return state;
        }
        return { items: [...state.items, item] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
      })),
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i),
        }));
      },
      
      clearQuote: () => set({ items: [] }),
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'quote-storage',
    }
  )
);
