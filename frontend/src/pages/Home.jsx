import { Link } from 'react-router-dom';

export const Home = () => (
  <div className="app-shell flex min-h-screen flex-col items-center justify-center p-6">
    <div className="card w-full max-w-sm p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
        🏪
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink">Đặt món bằng QR</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Quét mã QR trên bàn tại quán để xem thực đơn và đặt món trực tiếp từ điện thoại.
      </p>
      <Link
        to="/admin/login"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink py-3 text-sm font-semibold text-white"
      >
        Đăng nhập quản lý
      </Link>
    </div>
  </div>
);
