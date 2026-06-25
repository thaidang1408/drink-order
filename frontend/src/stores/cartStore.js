import { create } from 'zustand';
import { optionsKey } from '../utils/options';

const newLineId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useCartStore = create((set, get) => ({
  storeSlug: null,
  storeId: null,
  storeName: null,
  storePayment: null,
  tableNumber: null,
  tableLocked: false,
  items: [],

  initStore: (store, { tableNumber = null, tableLocked = false } = {}) =>
    set((state) => {
      const base = {
        storeSlug: store.slug,
        storeId: store.id,
        storeName: store.name,
        storePayment: store.payment ?? null,
        tableNumber: tableNumber ?? state.tableNumber,
        tableLocked: tableLocked || state.tableLocked,
      };

      if (state.storeSlug && state.storeSlug !== store.slug) {
        return { ...base, items: [], tableNumber, tableLocked };
      }

      if (tableNumber) {
        return { ...base, tableNumber, tableLocked: tableLocked || Boolean(tableNumber) };
      }

      return base;
    }),

  setTableNumber: (tableNumber, locked = false) =>
    set({
      tableNumber: tableNumber?.trim() || null,
      tableLocked: locked && Boolean(tableNumber?.trim()),
    }),

  clearTableNumber: () => set({ tableNumber: null, tableLocked: false }),

  addItem: (product, config = {}) =>
    set((state) => {
      const {
        options = [],
        optionsLabel = null,
        unitPrice = product.price,
        basePrice = product.price,
      } = config;
      const key = optionsKey(options);

      const existing = state.items.find(
        (item) => item.productId === product.id && optionsKey(item.options) === key,
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.cartLineId === existing.cartLineId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            cartLineId: newLineId(),
            productId: product.id,
            name: product.name,
            price: unitPrice,
            basePrice,
            image: product.image,
            quantity: 1,
            options,
            optionsLabel,
          },
        ],
      };
    }),

  updateQuantity: (cartLineId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.cartLineId !== cartLineId),
        };
      }

      return {
        items: state.items.map((item) =>
          item.cartLineId === cartLineId ? { ...item, quantity } : item,
        ),
      };
    }),

  removeItem: (cartLineId) =>
    set((state) => ({
      items: state.items.filter((item) => item.cartLineId !== cartLineId),
    })),

  clearCart: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
