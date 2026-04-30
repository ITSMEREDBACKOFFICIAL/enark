import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sku: string;
  size?: string;
  addedAt: number; // Timestamp for expiry
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'addedAt'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotal: () => number;
  clearExpiredItems: (expiryMinutes: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        const now = Date.now();
        if (existing) {
          set({
            items: get().items.map((i) => 
              i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1, addedAt: now } : i
            ),
            isOpen: true
          });
        } else {
          set({ items: [...get().items, { ...item, addedAt: now }], isOpen: true });
        }
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },
      updateQuantity: (variantId, quantity) => {
        set({
          items: get().items.map((i) => 
            i.variantId === variantId ? { ...i, quantity: Math.max(1, quantity) } : i
          )
        });
      },
      setIsOpen: (isOpen) => set({ isOpen }),
      getTotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      clearExpiredItems: (expiryMinutes) => {
        const now = Date.now();
        const expiryMs = expiryMinutes * 60 * 1000;
        const validItems = get().items.filter(item => now - item.addedAt < expiryMs);
        if (validItems.length !== get().items.length) {
          set({ items: validItems });
        }
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: 'alienkind-bag' }
  )
);
