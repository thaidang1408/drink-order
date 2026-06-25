import { useEffect, useRef } from 'react';
import {
  acquireSocket,
  joinOrderRoom,
  joinStoreRoom,
  leaveOrderRoom,
  leaveStoreRoom,
  onSocketEvent,
  releaseSocket,
} from '../services/socket.service';
import { SOCKET_EVENTS } from '../utils/constants';
import { useAuthStore } from '../stores/authStore';

export const useStoreSocket = ({ storeId, onOrderCreated, onOrderStatusUpdated, onStatsUpdated }) => {
  const handlersRef = useRef({ onOrderCreated, onOrderStatusUpdated, onStatsUpdated });
  handlersRef.current = { onOrderCreated, onOrderStatusUpdated, onStatsUpdated };

  useEffect(() => {
    if (!storeId) return undefined;

    acquireSocket();
    joinStoreRoom(storeId);

    const cleanups = [
      onSocketEvent(SOCKET_EVENTS.ORDER_CREATED, (data) => {
        handlersRef.current.onOrderCreated?.(data);
      }),
      onSocketEvent(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (data) => {
        handlersRef.current.onOrderStatusUpdated?.(data);
      }),
      onSocketEvent(SOCKET_EVENTS.STATS_UPDATED, (data) => {
        handlersRef.current.onStatsUpdated?.(data);
      }),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      leaveStoreRoom(storeId);
      releaseSocket();
    };
  }, [storeId]);
};

export const useOrderSocket = ({ orderNumber, onStatusUpdated }) => {
  const handlerRef = useRef(onStatusUpdated);
  handlerRef.current = onStatusUpdated;

  useEffect(() => {
    if (!orderNumber) return undefined;

    acquireSocket();
    joinOrderRoom(orderNumber);

    const cleanup = onSocketEvent(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (data) => {
      if (data.orderNumber === orderNumber) {
        handlerRef.current?.(data);
      }
    });

    return () => {
      cleanup();
      leaveOrderRoom(orderNumber);
      releaseSocket();
    };
  }, [orderNumber]);
};

export const useCurrentStore = () => {
  const stores = useAuthStore((state) => state.stores);
  const currentStoreId = useAuthStore((state) => state.currentStoreId);

  return stores.find((store) => store.id === currentStoreId) ?? stores[0] ?? null;
};
