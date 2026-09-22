/**
 * SPWN Apps 2.0 - Commerce & Cart Store
 * Location: src/stores/cartStore.ts
 */

import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weightGram: number;
  imageUrl: string;
  sku: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: { id: string; name: string; price: number; weightGram?: number; imageUrl?: string; sku?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  setOpen: (isOpen: boolean) => void;

  // Computed Getters
  getItemCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) => {
    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return { items: updated };
      }

      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            weightGram: product.weightGram || 100,
            imageUrl: product.imageUrl || '',
            sku: product.sku || product.id,
          },
        ],
      };
    });
  },

  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id: string, delta: number) => {
    set((state) => {
      const updated = state.items
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return { items: updated };
    });
  },

  clearCart: () => set({ items: [] }),
  setOpen: (isOpen: boolean) => set({ isOpen }),

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
