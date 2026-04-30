'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  addItem: (item: RecentlyViewedItem) => void;
  clearHistory: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        // Remove if exists to move to front
        const filtered = currentItems.filter((i) => i.id !== item.id);
        // Keep only last 10
        const newItems = [item, ...filtered].slice(0, 10);
        set({ items: newItems });
      },
      clearHistory: () => set({ items: [] }),
    }),
    { name: 'alienkind-history' }
  )
);
