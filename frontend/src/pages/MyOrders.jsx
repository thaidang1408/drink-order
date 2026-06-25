import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchStoreMenu } from '../api/menu.api';
import { Layout } from '../components/Layout';
import { Badge } from '../components/ui/Badge';
import { useStoreSocket } from '../hooks/useSocket';
import { useRecentOrderStore } from '../stores/recentOrderStore';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../utils/constants';
import { formatCurrency } from '../utils/format';

const OrderListItem = ({ slug, order }) => (
  <Link to={`/store/${slug}/track/${order.orderNumber}`} className="card-interactive block p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-bold text-ink">{order.orderNumber}</p>
        <p className="mt-0.5 text-sm font-semibold text-brand-700">
          {formatCurrency(order.totalAmount)}
        </p>
      </div>
      <Badge status={order.status}>{ORDER_STATUS_LABELS[order.status]}</Badge>
    </div>
    {(order.tableNumber || order.note || order.paymentMethod) && (
      <div className="mt-2 space-y-0.5 text-xs text-ink-muted">
        {order.tableNumber && <p>Bàn: {order.tableNumber}</p>}
        {order.paymentMethod && <p>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>}
        {order.note && <p className="line-clamp-1">Ghi chú: {order.note}</p>}
      </div>
    )}
  </Link>
);

export const MyOrders = () => {
  const { slug } = useParams();
  const [storeId, setStoreId] = useState(null);
  const orders = useRecentOrderStore((state) => state.ordersByStore[slug] ?? []);
  const updateOrderStatus = useRecentOrderStore((state) => state.updateOrderStatus);

  useEffect(() => {
    fetchStoreMenu(slug)
      .then((res) => setStoreId(res.data.store.id))
      .catch(() => setStoreId(null));
  }, [slug]);

  useStoreSocket({
    storeId,
    onOrderStatusUpdated: (updated) => {
      if (!updated.orderNumber) return;

      const known = useRecentOrderStore.getState().ordersByStore[slug] ?? [];
      if (known.some((order) => order.orderNumber === updated.orderNumber)) {
        updateOrderStatus(slug, updated.orderNumber, updated.status);
      }
    },
  });

  const active = orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status));
  const finished = orders.filter((o) => ['COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <Layout slug={slug} title="Đơn của tôi">
      <div className="space-y-5 p-4">
        {orders.length === 0 ? (
          <div className="card border-dashed p-10 text-center">
            <p className="text-4xl">📋</p>
            <p className="mt-3 font-semibold text-ink">Chưa có đơn nào</p>
            <p className="mt-1 text-sm text-ink-muted">
              Các đơn bạn đặt từ thiết bị này sẽ hiện ở đây.
            </p>
            <Link
              to={`/store/${slug}`}
              className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              Đặt món ngay
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="section-title mb-3">Đang xử lý ({active.length})</h2>
                <div className="space-y-2">
                  {active.map((order) => (
                    <OrderListItem key={order.orderNumber} slug={slug} order={order} />
                  ))}
                </div>
              </section>
            )}

            {finished.length > 0 && (
              <section>
                <h2 className="section-title mb-3">Lịch sử ({finished.length})</h2>
                <div className="space-y-2">
                  {finished.map((order) => (
                    <OrderListItem key={order.orderNumber} slug={slug} order={order} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
