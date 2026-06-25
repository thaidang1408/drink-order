import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../utils/constants';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

let socket = null;
let refCount = 0;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export const acquireSocket = () => {
  refCount += 1;
  const instance = getSocket();
  if (!instance.connected) instance.connect();
  return instance;
};

export const releaseSocket = () => {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinStoreRoom = (storeId) => {
  if (!storeId) return;
  getSocket().emit(SOCKET_EVENTS.JOIN_STORE, storeId);
};

export const leaveStoreRoom = (storeId) => {
  if (!storeId) return;
  getSocket().emit(SOCKET_EVENTS.LEAVE_STORE, storeId);
};

export const joinOrderRoom = (orderNumber) => {
  if (!orderNumber) return;
  getSocket().emit(SOCKET_EVENTS.JOIN_ORDER, orderNumber);
};

export const leaveOrderRoom = (orderNumber) => {
  if (!orderNumber) return;
  getSocket().emit(SOCKET_EVENTS.LEAVE_ORDER, orderNumber);
};

export const onSocketEvent = (event, handler) => {
  const instance = getSocket();
  instance.on(event, handler);
  return () => instance.off(event, handler);
};
