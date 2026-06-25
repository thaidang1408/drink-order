import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createOrder } from '../api/order.api';
import { fetchStoreMenu } from '../api/menu.api';
import { Layout } from '../components/Layout';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PaymentMethodPicker } from '../components/PaymentMethodPicker';
import { useCartStore } from '../stores/cartStore';
import { useRecentOrderStore } from '../stores/recentOrderStore';
import { formatCurrency } from '../utils/format';

export const Cart = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableFromUrl = searchParams.get('table')?.trim() || '';
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState(null);

  const items = useCartStore((state) => state.items);
  const cartSlug = useCartStore((state) => state.storeSlug);
  const storedTable = useCartStore((state) => state.tableNumber);
  const tableLocked = useCartStore((state) => state.tableLocked);
  const storePayment = useCartStore((state) => state.storePayment);
  const initStore = useCartStore((state) => state.initStore);
  const setTableNumberStore = useCartStore((state) => state.setTableNumber);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const saveOrder = useRecentOrderStore((state) => state.saveOrder);

  const slugMismatch = Boolean(cartSlug && cartSlug !== slug);
  const total = getTotal();
  const canUseBankTransfer = Boolean(storePayment?.bankQrImage);

  useEffect(() => {
    const loadStore = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const response = await fetchStoreMenu(slug);
        initStore(response.data.store, {
          tableNumber: tableFromUrl || undefined,
          tableLocked: Boolean(tableFromUrl),
        });
        if (tableFromUrl) {
          setTableNumberStore(tableFromUrl, true);
        }
      } catch (err) {
        setLoadError(err.message || 'Không thể tải thông tin quán');
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [slug, initStore, setTableNumberStore, tableFromUrl]);

  useEffect(() => {
    if (storedTable) {
      setTableNumber(storedTable);
    }
  }, [storedTable]);

  const handleSubmit = async () => {
    if (items.length === 0) return;

    if (slugMismatch) {
      setError('Giỏ hàng thuộc quán khác. Vui lòng quay lại thực đơn đúng quán.');
      return;
    }

    if (paymentMethod === 'BANK_TRANSFER' && !canUseBankTransfer) {
      setError('Quán chưa hỗ trợ chuyển khoản. Vui lòng chọn tiền mặt.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await createOrder({
        storeSlug: slug,
        tableNumber: tableNumber.trim() || undefined,
        note: note.trim() || undefined,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.options?.length ? { options: item.options } : {}),
        })),
      });

      clearCart();
      saveOrder(slug, response.data);
      navigate(`/store/${slug}/order-success/${response.data.orderNumber}`, {
        state: { order: response.data },
      });
    } catch (err) {
      setError(err.message || 'Không thể đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout slug={slug} title="Giỏ hàng" showCart={false}>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout slug={slug} title="Giỏ hàng" showCart={false}>
        <EmptyState title="Có lỗi xảy ra" description={loadError} icon="⚠️" />
      </Layout>
    );
  }

  return (
    <Layout
      slug={slug}
      title="Giỏ hàng"
      showCart={false}
      tableLabel={storedTable ? `Bàn ${storedTable}` : null}
    >
      <div className="border-b border-border px-4 py-2">
        <Link
          to={`/store/${slug}${tableFromUrl ? `?table=${encodeURIComponent(tableFromUrl)}` : ''}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700"
        >
          <span aria-hidden>←</span>
          <span>Quay lại thực đơn</span>
        </Link>
      </div>

      {slugMismatch && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Giỏ hàng đang thuộc quán khác.{' '}
          <Link to={`/store/${cartSlug}/cart`} className="font-semibold underline">
            Mở giỏ đúng quán
          </Link>{' '}
          hoặc quay lại thực đơn để đặt lại.
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Giỏ hàng trống"
          description="Chọn món từ thực đơn để bắt đầu đặt hàng."
          icon="🛒"
          action={
            <Link
              to={`/store/${slug}`}
              className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              Xem thực đơn
            </Link>
          }
        />
      ) : (
        <div className="space-y-4 px-4 pb-44">
          <p className="section-title">Món đã chọn ({items.length})</p>

          {items.map((item) => (
            <div key={item.cartLineId} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">{item.name}</h3>
                  {item.optionsLabel && (
                    <p className="mt-0.5 text-xs text-ink-muted">{item.optionsLabel}</p>
                  )}
                  <p className="mt-1 text-sm font-semibold text-brand-700">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartLineId)}
                  className="text-xs font-medium text-slate-400 hover:text-red-500"
                >
                  Xóa
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-medium shadow-sm"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-lg font-medium text-white"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold text-ink">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}

          <div className="card space-y-3 p-4">
            <p className="text-sm font-semibold text-ink">Thông tin đặt hàng</p>
            <div>
              <label htmlFor="tableNumber" className="mb-1.5 block text-xs font-medium text-ink-muted">
                Số bàn {tableLocked ? '' : '(tuỳ chọn)'}
              </label>
              <input
                id="tableNumber"
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="VD: 5"
                className="input-field disabled:bg-slate-50 disabled:text-ink-muted"
                disabled={tableLocked}
                readOnly={tableLocked}
              />
              {tableLocked && (
                <p className="mt-1 text-[11px] text-brand-700">
                  Tự nhận từ mã QR bàn — không cần nhập lại
                </p>
              )}
            </div>
            <div>
              <label htmlFor="note" className="mb-1.5 block text-xs font-medium text-ink-muted">
                Ghi chú
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="VD: Ít đường, mang đi..."
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="card p-4">
            <PaymentMethodPicker
              value={paymentMethod}
              onChange={setPaymentMethod}
              payment={storePayment}
              totalAmount={total}
              canUseBankTransfer={canUseBankTransfer}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="bottom-bar">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">Tổng thanh toán</p>
              <p className="text-2xl font-bold tracking-tight text-ink">{formatCurrency(total)}</p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || slugMismatch}
              className="flex-1 rounded-full bg-ink py-3.5 text-center text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Xác nhận đặt'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};
