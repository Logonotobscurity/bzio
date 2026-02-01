"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@/lib/schema';
import { toast } from '@/hooks/use-toast';

export interface QuoteItem extends Product {
  quantity: number;
}

interface QuoteState {
  items: QuoteItem[];
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggleDrawer: () => void;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearQuote: () => void;
  getItemCount: () => number;
}

export const useQuoteStore = create<QuoteState>()(persist((set, get) => ({
  items: [] as any[],
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  addProduct: (product, quantity = 1) => {
    const { items } = get();
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      toast({
        title: "Already in Quote",
        description: `${product.name} is already in your quote list.`,
      });
      return;
    }

    set((state) => ({
      items: [...state.items, { ...product, quantity }],
    }));
    toast({
        title: "Added to Quote",
        description: `${product.name} has been added to your quote list.`,
    });
  },
  removeProduct: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },
  clearQuote: () => {
    set({ items: [] });
  },
}), {
  name: 'quote-storage',
  partialize: (state) => ({ items: state.items }),
}));
