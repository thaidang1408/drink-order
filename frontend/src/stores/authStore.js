import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      stores: [],
      currentStoreId: null,

      setAuth: ({ token, user, stores }) =>
        set({
          token,
          user,
          stores,
          currentStoreId: stores[0]?.id ?? null,
        }),

      setSession: ({ token, user, stores }) =>
        set((state) => ({
          token,
          user,
          stores,
          currentStoreId: stores.some((store) => store.id === state.currentStoreId)
            ? state.currentStoreId
            : stores[0]?.id ?? null,
        })),

      setCurrentStore: (storeId) => set({ currentStoreId: storeId }),

      updateStoreInList: (storeId, patch) =>
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? { ...store, ...patch } : store,
          ),
        })),

      logout: () =>
        set({
          token: null,
          user: null,
          stores: [],
          currentStoreId: null,
        }),
    }),
    { name: 'qr-ordering-auth' },
  ),
);
