export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const API_PREFIX = '/api/v1';

export const SOCKET_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  STATS_UPDATED: 'stats:updated',
  JOIN_STORE: 'store:join',
  LEAVE_STORE: 'store:leave',
  JOIN_ORDER: 'order:join',
  LEAVE_ORDER: 'order:leave',
};

export const SOCKET_ROOMS = {
  store: (storeId) => `store:${storeId}`,
  order: (orderNumber) => `order:${orderNumber}`,
};
