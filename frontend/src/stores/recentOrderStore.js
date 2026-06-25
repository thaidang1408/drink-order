import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_ORDERS_PER_STORE = 20;

const toSummary = (order) => ({
  orderNumber: order.orderNumber,
  status: order.status,
  totalAmount: order.totalAmount,
  tableNumber: order.tableNumber || null,
  note: order.note || null,
  createdAt: order.createdAt || new Date().toISOString(),
});

export const useRecentOrderStore = create(
  persist(
    (set, get) => ({
      ordersByStore: {},

      saveOrder: (storeSlug, order) =>
        set((state) => {
          const existing = state.ordersByStore[storeSlug] || [];
          const summary = toSummary(order);
          const filtered = existing.filter((o) => o.orderNumber !== summary.orderNumber);
          const next = [summary, ...filtered].slice(0, MAX_ORDERS_PER_STORE);

          return {
            ordersByStore: {
              ...state.ordersByStore,
              [storeSlug]: next,
            },
          };
        }),

      updateOrderStatus: (storeSlug, orderNumber, status) =>
        set((state) => {
          const list = state.ordersByStore[storeSlug];
          if (!list) return state;

          return {
            ordersByStore: {
              ...state.ordersByStore,
              [storeSlug]: list.map((o) =>
                o.orderNumber === orderNumber ? { ...o, status } : o,
              ),
            },
          };
        }),

      getOrders: (storeSlug) => get().ordersByStore[storeSlug] ?? [],

      getActiveOrders: (storeSlug) =>
        (get().ordersByStore[storeSlug] ?? []).filter(
          (o) => !['COMPLETED', 'CANCELLED'].includes(o.status),
        ),

      removeOrder: (storeSlug, orderNumber) =>
        set((state) => {
          const list = state.ordersByStore[storeSlug];
          if (!list) return state;

          return {
            ordersByStore: {
              ...state.ordersByStore,
              [storeSlug]: list.filter((o) => o.orderNumber !== orderNumber),
            },
          };
        }),
    }),
    {
      name: 'qr-recent-orders',
      version: 1,
      migrate: (persisted) => {
        if (persisted?.orders && !persisted.ordersByStore) {
          const ordersByStore = {};
          for (const [slug, order] of Object.entries(persisted.orders)) {
            if (order?.orderNumber) {
              ordersByStore[slug] = [toSummary(order)];
            }
          }
          return { ordersByStore };
        }
        return persisted;
      },
    },
  ),
);
