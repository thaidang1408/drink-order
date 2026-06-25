import { Link } from 'react-router-dom';

export const Home = () => (
  <div className="app-shell flex min-h-screen flex-col items-center justify-center p-6">
    <div className="card w-full max-w-sm p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
        🏪
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink">Đặt món bằng QR</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Khách hàng: quét mã QR trên bàn để vào thực đơn và đặt món.
      </p>
      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Nếu bạn thấy trang này sau khi quét QR, mã QR có thể chưa trỏ đúng link
        <span className="font-semibold"> /store/ten-quan</span>. Vào admin tải lại mã QR.
      </p>
      <Link
        to="/admin/login"
        className="mt-6 inline-flex text-sm font-medium text-ink-muted hover:text-ink"
      >
        Đăng nhập quản lý →
      </Link>
    </div>
  </div>
);
