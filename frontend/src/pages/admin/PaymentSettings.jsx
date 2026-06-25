import { useEffect, useRef, useState } from 'react';
import { fetchPaymentSettings, updatePaymentSettings } from '../../api/admin.api';
import { uploadImage } from '../../api/store.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useCurrentStore } from '../../hooks/useSocket';

const emptyForm = {
  bankName: '',
  bankAccountNo: '',
  bankAccountName: '',
  bankQrImage: '',
};

export const PaymentSettings = () => {
  const store = useCurrentStore();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    if (!store?.id) return;
    const response = await fetchPaymentSettings(store.id);
    setForm({
      bankName: response.data.bankName || '',
      bankAccountNo: response.data.bankAccountNo || '',
      bankAccountName: response.data.bankAccountName || '',
      bankQrImage: response.data.bankQrImage || '',
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [store?.id]);

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !store?.id) return;

    try {
      setUploading(true);
      setError('');
      const response = await uploadImage(store.id, file);
      setForm((prev) => ({ ...prev, bankQrImage: response.data.url }));
      setSuccess('Đã tải ảnh QR. Nhấn "Lưu cài đặt" để áp dụng.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      await updatePaymentSettings(store.id, form);
      setSuccess('Đã lưu cài đặt thanh toán.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Thanh toán">
      <div className="mx-auto w-full max-w-lg">
        {loading && <LoadingSpinner />}

        {!loading && (
          <Card>
            <p className="mb-5 text-center text-sm text-ink-muted">
              Cấu hình chuyển khoản. Khách chọn &quot;Chuyển khoản&quot; sẽ thấy mã QR trên giỏ
              hàng và sau khi đặt.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ngân hàng"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="VD: Vietcombank"
              />
              <Input
                label="Số tài khoản"
                value={form.bankAccountNo}
                onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })}
                placeholder="VD: 1234567890"
              />
              <Input
                label="Tên chủ tài khoản"
                value={form.bankAccountName}
                onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                placeholder="VD: NGUYEN VAN A"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mã QR chuyển khoản (VietQR)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrUpload}
                />

                <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-slate-50 p-5">
                  {form.bankQrImage ? (
                    <img
                      src={form.bankQrImage}
                      alt="QR preview"
                      className="h-44 w-44 rounded-xl border border-white bg-white object-contain p-2 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-44 w-44 flex-col items-center justify-center rounded-xl bg-white text-center text-xs text-ink-muted">
                      <span className="mb-2 text-3xl">📷</span>
                      Chưa có ảnh QR
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? 'Đang tải...' : form.bankQrImage ? 'Đổi ảnh QR' : 'Thêm ảnh QR'}
                    </Button>
                    {form.bankQrImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setForm((prev) => ({ ...prev, bankQrImage: '' }))}
                      >
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-center text-[11px] text-ink-muted">
                    PNG, JPG — nên dùng ảnh VietQR từ app ngân hàng
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};
