import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { trackOrder } from '../api/order.api';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BankTransferPanel } from '../components/PaymentMethodPicker';
import { useRecentOrderStore } from '../stores/recentOrderStore';
import { formatCurrency } from '../utils/format';

const statusLabel = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

const paymentLabel = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

const ActionLink = ({ to, children, primary = false }) => (
  <Link
    to={to}
    className={`block w-full rounded-full py-3.5 text-center text-sm font-semibold transition ${
      primary
        ? 'bg-ink text-white shadow-sm'
        : 'border border-border bg-white text-ink hover:bg-slate-50'
    }`}
  >
    {children}
  </Link>
);

export const OrderSuccess = () => {
  const { slug, orderNumber } = useParams();
  const location = useLocation();
  const saveOrder = useRecentOrderStore((state) => state.saveOrder);
  const [order, setOrder] = useState(location.state?.order ?? null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order && slug) {
      saveOrder(slug, order);
    }
  }, [order, slug, saveOrder]);

  useEffect(() => {
    if (location.state?.order) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await trackOrder(orderNumber);
        setOrder(response.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [location.state?.order, orderNumber]);

  if (loading) {
    return (
      <Layout slug={slug} title="Đặt hàng thành công" showCart={false}>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout slug={slug} title="Đặt hàng thành công" showCart={false}>
      <div className="space-y-4 px-4 py-6">
        <div className="card p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl text-brand-700">
            ✓
          </div>
          <h2 className="text-xl font-bold text-ink">Đã gửi đơn!</h2>
          <p className="mt-2 text-sm text-ink-muted">Quán đã nhận đơn và sẽ xử lý sớm.</p>
        </div>

        <div className="card divide-y divide-border p-0">
          {[
            ['Mã đơn', orderNumber, true],
            order?.status && ['Trạng thái', statusLabel[order.status]],
            order?.totalAmount != null && ['Tổng tiền', formatCurrency(order.totalAmount), true],
            order?.tableNumber && ['Số bàn', order.tableNumber],
            order?.paymentMethod && ['Thanh toán', paymentLabel[order.paymentMethod]],
          ]
            .filter(Boolean)
            .map(([label, value, bold]) => (
              <div key={label} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-ink-muted">{label}</span>
                <span className={bold ? 'font-bold text-ink' : 'font-medium text-ink'}>{value}</span>
              </div>
            ))}
        </div>

        {order?.paymentMethod === 'BANK_TRANSFER' && order?.payment && (
          <BankTransferPanel
            payment={order.payment}
            totalAmount={order.totalAmount}
            orderNumber={orderNumber}
          />
        )}

        {order?.items?.length > 0 && (
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Chi tiết món</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-ink-muted">
                    {item.productName} × {item.quantity}
                    {item.optionsLabel && (
                      <span className="block text-xs text-slate-400">{item.optionsLabel}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <ActionLink to={`/store/${slug}/track/${orderNumber}`}>Theo dõi đơn hàng</ActionLink>
          <ActionLink to={`/store/${slug}/my-orders`}>Đơn của tôi</ActionLink>
          <ActionLink to={`/store/${slug}`} primary>
            Đặt thêm món
          </ActionLink>
        </div>
      </div>
    </Layout>
  );
};
