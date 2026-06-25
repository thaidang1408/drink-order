import { Server } from 'socket.io';
import socketConfig from '../../config/socket.js';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../shared/constants/index.js';

let io = null;

const joinRoom = (socket, room, label) => {
  socket.join(room);
  console.log(`[Socket.IO] ${socket.id} joined ${label}: ${room}`);
};

const leaveRoom = (socket, room, label) => {
  socket.leave(room);
  console.log(`[Socket.IO] ${socket.id} left ${label}: ${room}`);
};

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, socketConfig);

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_STORE, (storeId) => {
      if (!storeId) return;
      joinRoom(socket, SOCKET_ROOMS.store(storeId), 'store room');
    });

    socket.on(SOCKET_EVENTS.LEAVE_STORE, (storeId) => {
      if (!storeId) return;
      leaveRoom(socket, SOCKET_ROOMS.store(storeId), 'store room');
    });

    socket.on(SOCKET_EVENTS.JOIN_ORDER, (orderNumber) => {
      if (!orderNumber) return;
      joinRoom(socket, SOCKET_ROOMS.order(orderNumber), 'order room');
    });

    socket.on(SOCKET_EVENTS.LEAVE_ORDER, (orderNumber) => {
      if (!orderNumber) return;
      leaveRoom(socket, SOCKET_ROOMS.order(orderNumber), 'order room');
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocketServer first.');
  }
  return io;
};

export const closeSocketServer = () =>
  new Promise((resolve) => {
    if (!io) {
      resolve();
      return;
    }

    io.close(() => {
      io = null;
      resolve();
    });
  });

export const emitToStore = (storeId, event, data) => {
  getIO().to(SOCKET_ROOMS.store(storeId)).emit(event, data);
};

export const emitToOrder = (orderNumber, event, data) => {
  getIO().to(SOCKET_ROOMS.order(orderNumber)).emit(event, data);
};

export const emitOrderStatusUpdated = (storeId, orderNumber, data) => {
  const socket = getIO();
  const payload = { ...data, storeId, orderNumber };

  socket.to(SOCKET_ROOMS.store(storeId)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, payload);
  socket.to(SOCKET_ROOMS.store(storeId)).emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, payload);
  socket.to(SOCKET_ROOMS.order(orderNumber)).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, payload);
  socket.to(SOCKET_ROOMS.order(orderNumber)).emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, payload);
};

export const emitOrderCreated = (storeId, data) => {
  emitToStore(storeId, SOCKET_EVENTS.ORDER_CREATED, data);
};

export const emitStatsUpdated = (storeId, stats) => {
  emitToStore(storeId, SOCKET_EVENTS.STATS_UPDATED, { storeId, stats });
};
