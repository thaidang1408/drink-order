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

export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

export const TRACKING_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

export const KANBAN_COLUMNS = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
];

export const PAYMENT_METHOD_LABELS = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

export const STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
  PREPARING: 'bg-violet-50 text-violet-800 ring-1 ring-violet-200',
  READY: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};
