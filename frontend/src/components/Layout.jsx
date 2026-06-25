import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useRecentOrderStore } from '../stores/recentOrderStore';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { formatCurrency } from '../utils/format';

export const Layout = ({
  children,
  slug,
  title,
  showCart = true,
  subtitle,
  hideBrand = false,
  store,
  tableLabel,
}) => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const orders = useRecentOrderStore((state) =>
    slug ? state.ordersByStore[slug] ?? [] : [],
  );
  const activeOrders = orders.filter(
    (o) => !['COMPLETED', 'CANCELLED'].includes(o.status),
  );

  const headerTitle = store?.name ?? title;
  const headerSubtitle = store?.description?.trim() || subtitle || null;
  const showOrderLabel = !store && !hideBrand;

  return (
    <div className="app-shell pb-28">
      <header className="glass-header">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {store && (
              store.logo ? (
                <img
                  src={store.logo}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  🏪
                </div>
              )
            )}
            <div className="min-w-0 flex-1">
              {showOrderLabel && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Đặt món
                </p>
              )}
              <h1 className="truncate text-base font-bold tracking-tight text-ink sm:text-lg">
                {headerTitle}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {tableLabel && (
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                    {tableLabel}
                  </span>
                )}
                {headerSubtitle && (
                  <p className="truncate text-xs text-ink-muted">{headerSubtitle}</p>
                )}
              </div>
            </div>
          </div>
          {slug && (
            <div className="flex shrink-0 items-center gap-2">
              {orders.length > 0 && (
                <Link
                  to={`/store/${slug}/my-orders`}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg ring-1 ring-border"
                  title="Đơn của tôi"
                >
                  📋
                  {activeOrders.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                      {activeOrders.length}
                    </span>
                  )}
                </Link>
              )}
              {showCart && (
                <Link
                  to={`/store/${slug}/cart`}
                  className="relative flex h-10 items-center gap-1.5 rounded-full bg-ink pl-3 pr-3.5 text-sm font-semibold text-white shadow-md"
                >
                  <span className="text-base">🛒</span>
                  {itemCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-bold">
                      {itemCount}
                    </span>
                  ) : (
                    <span className="text-xs">Giỏ</span>
                  )}
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {activeOrders.length > 0 && slug && (
        <div className="mx-4 mt-3">
          <Link
            to={`/store/${slug}/track/${activeOrders[0].orderNumber}`}
            className="flex items-center justify-between rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white px-4 py-3 text-sm shadow-sm"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-brand-800">Đơn đang xử lý</p>
              <p className="truncate font-semibold text-ink">{activeOrders[0].orderNumber}</p>
              <p className="text-xs text-brand-700">
                {ORDER_STATUS_LABELS[activeOrders[0].status]} ·{' '}
                {formatCurrency(activeOrders[0].totalAmount)}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
              Xem
            </span>
          </Link>
        </div>
      )}

      <main className="min-w-0">{children}</main>
    </div>
  );
};
