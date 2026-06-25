import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '../../api/admin.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useCurrentStore, useStoreSocket } from '../../hooks/useSocket';
import { playNotificationSound } from '../../utils/notificationSound';
import { SoundAlertBanner } from '../../components/admin/SoundAlertBanner';
import { formatCurrency } from '../../utils/format';
import {
  KANBAN_COLUMNS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../utils/constants';

const NEXT_STATUS = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
};

const formatItemsSummary = (items = []) => {
  const text = items
    .map((item) => `${item.productName} ×${item.quantity}`)
    .join(', ');
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
};

const OrderCard = ({ order, onAdvance, onCancel, updating, compact = false }) => (
  <div className="card shrink-0 p-3">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-bold text-ink">{order.orderNumber}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {order.tableNumber ? (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
              Bàn {order.tableNumber}
            </span>
          ) : null}
          {order.paymentMethod && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                order.paymentMethod === 'BANK_TRANSFER'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </span>
          )}
        </div>
      </div>
      <p className="shrink-0 text-sm font-bold text-brand-700">
        {formatCurrency(order.totalAmount)}
      </p>
    </div>

    {order.note && !compact && (
      <p className="mt-2 line-clamp-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900">
        {order.note}
      </p>
    )}

    <ul className="mt-2 space-y-0.5 text-[11px] leading-relaxed text-ink-muted">
      {order.items?.slice(0, compact ? 2 : 6).map((item) => (
        <li key={item.id} className="truncate">
          <span className="font-medium text-slate-700">{item.productName}</span> ×{item.quantity}
          {item.optionsLabel && (
            <span className="text-slate-400"> · {item.optionsLabel}</span>
          )}
        </li>
      ))}
      {(order.items?.length ?? 0) > (compact ? 2 : 6) && (
        <li className="text-slate-400">+{(order.items?.length ?? 0) - (compact ? 2 : 6)} món...</li>
      )}
    </ul>

    {(onAdvance || onCancel) && (
      <div className="mt-2.5 flex gap-1.5 border-t border-border pt-2.5">
        {onAdvance && NEXT_STATUS[order.status] && (
          <Button
            variant="accent"
            size="sm"
            className="flex-1 !py-1.5 text-[11px]"
            disabled={updating}
            onClick={() => onAdvance(order, NEXT_STATUS[order.status])}
          >
            {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]]}
          </Button>
        )}
        {onCancel && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
          <Button
            variant="danger"
            size="sm"
            className="!px-2.5 !py-1.5 text-[11px]"
            disabled={updating}
            onClick={() => onCancel(order)}
          >
            Huỷ
          </Button>
        )}
      </div>
    )}
  </div>
);

const OrderListRow = ({ order, onAdvance, onCancel, updating }) => (
  <div className="card grid gap-3 p-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto_auto] md:items-center">
    <div className="min-w-0">
      <p className="font-mono text-xs font-bold text-ink">{order.orderNumber}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        <Badge status={order.status}>{ORDER_STATUS_LABELS[order.status]}</Badge>
        {order.tableNumber && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium">
            Bàn {order.tableNumber}
          </span>
        )}
        {order.paymentMethod && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </span>
        )}
      </div>
    </div>

    <div className="min-w-0 text-xs text-ink-muted">
      <p className="line-clamp-2">{formatItemsSummary(order.items)}</p>
      {order.note && <p className="mt-1 line-clamp-1 text-amber-800">Ghi chú: {order.note}</p>}
    </div>

    <p className="text-right text-sm font-bold text-brand-700 md:min-w-24">
      {formatCurrency(order.totalAmount)}
    </p>

    <div className="flex gap-1.5 md:justify-end">
      {onAdvance && NEXT_STATUS[order.status] && (
        <Button
          variant="accent"
          size="sm"
          className="!py-1.5 text-[11px]"
          disabled={updating}
          onClick={() => onAdvance(order, NEXT_STATUS[order.status])}
        >
          Tiếp
        </Button>
      )}
      {onCancel && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
        <Button
          variant="danger"
          size="sm"
          className="!px-2.5 !py-1.5 text-[11px]"
          disabled={updating}
          onClick={() => onCancel(order)}
        >
          Huỷ
        </Button>
      )}
    </div>
  </div>
);

export const OrdersBoard = () => {
  const store = useCurrentStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [view, setView] = useState('kanban');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadOrders = useCallback(async () => {
    if (!store?.id) return;

    try {
      const response = await fetchOrders(store.id);
      setOrders(response.data);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const upsertOrder = useCallback((incoming) => {
    setOrders((prev) => {
      const index = prev.findIndex((o) => o.id === incoming.id);
      if (index === -1) return [incoming, ...prev];
      const next = [...prev];
      next[index] = incoming;
      return next;
    });
  }, []);

  useStoreSocket({
    storeId: store?.id,
    onOrderCreated: (incoming) => {
      void playNotificationSound();
      upsertOrder(incoming);
    },
    onOrderStatusUpdated: upsertOrder,
  });

  const handleStatusChange = async (order, status) => {
    try {
      setUpdatingId(order.id);
      const response = await updateOrderStatus(store.id, order.id, status);
      upsertOrder(response.data);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

  const filteredActive =
    statusFilter === 'ALL'
      ? activeOrders
      : activeOrders.filter((o) => o.status === statusFilter);

  const statusCounts = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = activeOrders.filter((o) => o.status === status).length;
      return acc;
    },
    { ALL: activeOrders.length },
  );

  return (
    <AdminLayout title="Đơn hàng">
      <SoundAlertBanner className="mb-4" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <div className="flex w-max min-w-full flex-wrap gap-1.5 md:w-auto">
            {['ALL', ...KANBAN_COLUMNS].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink-muted ring-1 ring-border hover:text-ink'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : ORDER_STATUS_LABELS[status]}
                <span className="ml-1 opacity-80">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              view === 'kanban' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
            }`}
          >
            Bảng cột
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              view === 'list' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
            }`}
          >
            Danh sách
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && view === 'kanban' && statusFilter === 'ALL' && (
        <div className="overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:overflow-visible md:px-0">
          <div className="flex min-w-max gap-3 md:grid md:min-w-0 md:grid-cols-5 md:gap-2">
            {KANBAN_COLUMNS.map((status) => {
              const columnOrders = activeOrders.filter((o) => o.status === status);

              return (
                <div
                  key={status}
                  className="flex w-[min(78vw,240px)] shrink-0 flex-col rounded-2xl bg-slate-100/80 p-2 md:w-full md:min-w-0"
                  style={{ maxHeight: 'calc(100dvh - 13rem)' }}
                >
                  <div className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                    <h3 className="truncate text-xs font-bold uppercase tracking-wide text-ink">
                      {ORDER_STATUS_LABELS[status]}
                    </h3>
                    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-ink">
                      {columnOrders.length}
                    </span>
                  </div>
                  <div className="min-h-[120px] min-w-0 flex-1 space-y-2 overflow-y-auto pr-0.5 scrollbar-none">
                    {columnOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        compact
                        updating={updatingId === order.id}
                        onAdvance={handleStatusChange}
                        onCancel={(o) => handleStatusChange(o, 'CANCELLED')}
                      />
                    ))}
                    {columnOrders.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-400">
                        Chưa có đơn
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="w-2 shrink-0 md:hidden" aria-hidden />
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-muted md:hidden">
            Vuốt ngang để xem đủ {KANBAN_COLUMNS.length} cột
          </p>
        </div>
      )}

      {!loading && (view === 'list' || statusFilter !== 'ALL') && (
        <div className="space-y-2">
          {filteredActive.length === 0 ? (
            <div className="card border-dashed p-8 text-center text-sm text-ink-muted">
              Không có đơn ở trạng thái này
            </div>
          ) : (
            filteredActive.map((order) => (
              <OrderListRow
                key={order.id}
                order={order}
                updating={updatingId === order.id}
                onAdvance={handleStatusChange}
                onCancel={(o) => handleStatusChange(o, 'CANCELLED')}
              />
            ))
          )}
        </div>
      )}

      {!loading && cancelledOrders.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-semibold text-red-600">
            Đã huỷ ({cancelledOrders.length})
          </summary>
          <div className="mt-2 space-y-2">
            {cancelledOrders.map((order) => (
              <OrderListRow key={order.id} order={order} updating={false} />
            ))}
          </div>
        </details>
      )}
    </AdminLayout>
  );
};
