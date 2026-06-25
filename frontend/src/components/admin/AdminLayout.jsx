import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

const navItems = [
  { to: '/admin', label: 'Tổng quan', short: 'Tổng quan', end: true },
  { to: '/admin/orders', label: 'Đơn hàng', short: 'Đơn' },
  { to: '/admin/products', label: 'Sản phẩm', short: 'Món' },
  { to: '/admin/categories', label: 'Danh mục', short: 'DM' },
  { to: '/admin/options', label: 'Tuỳ chọn', short: 'Opt' },
  { to: '/admin/settings', label: 'Cài đặt', short: 'Setup' },
  { to: '/admin/payment', label: 'Thanh toán', short: 'TT' },
  { to: '/admin/qr', label: 'Mã QR', short: 'QR' },
];

export const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const stores = useAuthStore((state) => state.stores);
  const currentStoreId = useAuthStore((state) => state.currentStoreId);
  const setCurrentStore = useAuthStore((state) => state.setCurrentStore);
  const logout = useAuthStore((state) => state.logout);

  const currentStore = stores.find((s) => s.id === currentStoreId);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-ink text-white'
        : 'text-ink-muted hover:bg-slate-100 hover:text-ink'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex shrink-0 flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-semibold ${
      isActive ? 'text-ink' : 'text-slate-400'
    }`;

  return (
    <div className="app-shell-admin pb-20 md:pb-6">
      <header className="glass-header">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Quản lý quán
            </p>
            <h1 className="truncate text-lg font-bold text-ink">{title}</h1>
            {currentStore && (
              <p className="truncate text-xs text-ink-muted">{currentStore.name}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {stores.length > 1 && (
              <select
                value={currentStoreId || ''}
                onChange={(e) => setCurrentStore(e.target.value)}
                className="input-field !w-auto !py-2 text-xs"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Thoát
            </Button>
          </div>
        </div>
        <p className="border-t border-border px-4 py-2 text-xs text-ink-muted">{user?.email}</p>
      </header>

      <nav className="hidden border-b border-border bg-white px-4 py-2 md:block">
        <div className="flex flex-wrap gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="p-4 md:p-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-xl md:hidden">
        <div className="flex overflow-x-auto px-1 py-1 scrollbar-none">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={mobileNavClass}>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs ${
                  item.end ? '' : ''
                }`}
              >
                {item.short}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
