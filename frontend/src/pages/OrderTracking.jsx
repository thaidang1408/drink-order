import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { trackOrder } from '../api/order.api';
import { Layout } from '../components/Layout';
import { BankTransferPanel } from '../components/PaymentMethodPicker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { useOrderSocket } from '../hooks/useSocket';
import { useRecentOrderStore } from '../stores/recentOrderStore';
import { formatCurrency } from '../utils/format';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, TRACKING_STEPS } from '../utils/constants';

const StatusTimeline = ({ status }) => {
  const currentIndex = TRACKING_STEPS.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        Đơn hàng đã bị huỷ
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {TRACKING_STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const active = index === currentIndex;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done ? 'bg-ink text-white' : 'bg-slate-100 text-slate-400'
                } ${active ? 'ring-4 ring-slate-200' : ''}`}
              >
                {done ? '✓' : index + 1}
              </div>
              {index < TRACKING_STEPS.length - 1 && (
                <div className={`my-1 w-0.5 flex-1 min-h-4 ${done ? 'bg-ink' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="pb-5 pt-1">
              <p className={`text-sm font-medium ${done ? 'text-ink' : 'text-slate-400'}`}>
                {ORDER_STATUS_LABELS[step]}
              </p>
              {active && <p className="text-xs text-brand-700">Đang ở bước này</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const OrderTracking = () => {
  const { slug, orderNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const saveOrder = useRecentOrderStore((state) => state.saveOrder);
  const updateOrderStatus = useRecentOrderStore((state) => state.updateOrderStatus);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await trackOrder(orderNumber);
      setData(response.data);
      saveOrder(response.data.store.slug, response.data.order);
    } catch (err) {
      setError(err.message || 'Không tìm thấy đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, saveOrder]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useOrderSocket({
    orderNumber,
    onStatusUpdated: (updated) => {
      if (slug && updated.orderNumber) {
        updateOrderStatus(slug, updated.orderNumber, updated.status);
      }
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, order: { ...prev.order, ...updated } };
      });
    },
  });

  if (loading) {
    return (
      <Layout slug={slug} title="Theo dõi đơn" showCart={false}>
        <LoadingSpinner label="Đang tải đơn hàng..." />
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout slug={slug} title="Theo dõi đơn" showCart={false}>
        <p className="p-6 text-center text-sm text-red-600">{error}</p>
      </Layout>
    );
  }

  const { order, store, payment } = data;

  return (
    <Layout slug={slug} title="Theo dõi đơn" showCart={false} subtitle={store.name}>
      <div className="space-y-4 p-4">
        <div className="card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-ink-muted">Mã đơn</p>
              <p className="text-lg font-bold text-ink">{order.orderNumber}</p>
            </div>
            <Badge status={order.status}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-brand-700">
            {formatCurrency(order.totalAmount)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
            {order.tableNumber && (
              <span className="rounded-md bg-slate-100 px-2 py-1">Bàn {order.tableNumber}</span>
            )}
            {order.paymentMethod && (
              <span className="rounded-md bg-slate-100 px-2 py-1">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </span>
            )}
            {order.note && (
              <span className="rounded-md bg-slate-100 px-2 py-1">Ghi chú: {order.note}</span>
            )}
          </div>
        </div>

        {order.paymentMethod === 'BANK_TRANSFER' && payment && (
          <BankTransferPanel
            payment={payment}
            totalAmount={order.totalAmount}
            orderNumber={order.orderNumber}
          />
        )}

        <div className="card p-4">
          <h2 className="mb-4 text-sm font-semibold text-ink">Tiến trình</h2>
          <StatusTimeline status={order.status} />
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">Chi tiết món</h3>
          <div className="space-y-2 text-sm">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span className="text-ink-muted">
                  {item.productName} × {item.quantity}
                  {item.optionsLabel && (
                    <span className="block text-xs text-slate-400">{item.optionsLabel}</span>
                  )}
                </span>
                <span className="shrink-0 font-medium text-ink">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Link
            to={`/store/${slug}/my-orders`}
            className="flex-1 rounded-full border border-border bg-white py-3 text-center text-sm font-semibold text-ink"
          >
            Tất cả đơn
          </Link>
          <Link
            to={`/store/${slug}`}
            className="flex-1 rounded-full bg-ink py-3 text-center text-sm font-semibold text-white"
          >
            Đặt thêm
          </Link>
        </div>
      </div>
    </Layout>
  );
};
