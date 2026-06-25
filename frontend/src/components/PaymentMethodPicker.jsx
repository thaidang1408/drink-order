import { useState } from 'react';
import { formatCurrency } from '../utils/format';

export const BankTransferPanel = ({ payment, totalAmount, orderNumber }) => {
  const [imageError, setImageError] = useState(false);

  if (!payment?.bankQrImage) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Quán chưa cấu hình mã QR. Vui lòng chọn tiền mặt hoặc liên hệ nhân viên.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
      <p className="text-sm font-semibold text-ink">Quét mã chuyển khoản</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-brand-700">
        {formatCurrency(totalAmount)}
      </p>
      {orderNumber && (
        <p className="mt-1 text-xs text-ink-muted">
          Nội dung: <span className="font-mono font-semibold text-ink">{orderNumber}</span>
        </p>
      )}
      {!imageError ? (
        <img
          src={payment.bankQrImage}
          alt="Mã QR chuyển khoản"
          referrerPolicy="no-referrer"
          className="mx-auto mt-4 h-48 w-48 rounded-2xl border border-white bg-white p-2 object-contain shadow-sm"
          onError={() => setImageError(true)}
        />
      ) : (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Không tải được ảnh QR. Vui lòng chuyển khoản theo thông tin bên dưới.
        </p>
      )}
      <div className="mt-4 space-y-1 text-left text-sm text-slate-700">
        {payment.bankName && <p>Ngân hàng: {payment.bankName}</p>}
        {payment.bankAccountNo && <p>STK: {payment.bankAccountNo}</p>}
        {payment.bankAccountName && <p>Chủ TK: {payment.bankAccountName}</p>}
      </div>
    </div>
  );
};

export const PaymentMethodPicker = ({
  value,
  onChange,
  payment,
  totalAmount,
  canUseBankTransfer,
}) => (
  <div className="space-y-4">
    <p className="text-sm font-semibold text-ink">Thanh toán</p>
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange('CASH')}
        className={`rounded-xl border-2 px-3 py-4 text-left transition ${
          value === 'CASH'
            ? 'border-ink bg-ink text-white'
            : 'border-border bg-white text-ink hover:border-slate-300'
        }`}
      >
        <span className="text-lg">💵</span>
        <p className="mt-2 text-sm font-semibold">Tiền mặt</p>
        <p className={`mt-0.5 text-xs ${value === 'CASH' ? 'text-slate-300' : 'text-ink-muted'}`}>
          Trả khi nhận món
        </p>
      </button>
      <button
        type="button"
        onClick={() => onChange('BANK_TRANSFER')}
        disabled={!canUseBankTransfer}
        className={`rounded-xl border-2 px-3 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
          value === 'BANK_TRANSFER'
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-border bg-white text-ink hover:border-slate-300'
        }`}
      >
        <span className="text-lg">🏦</span>
        <p className="mt-2 text-sm font-semibold">Chuyển khoản</p>
        <p
          className={`mt-0.5 text-xs ${
            value === 'BANK_TRANSFER' ? 'text-brand-100' : 'text-ink-muted'
          }`}
        >
          Quét QR ngay
        </p>
      </button>
    </div>

    {value === 'BANK_TRANSFER' && (
      <BankTransferPanel payment={payment} totalAmount={totalAmount} />
    )}
  </div>
);
