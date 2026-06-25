import { useEffect, useRef, useState } from 'react';
import { fetchStoreSettings, updateStoreSettings } from '../../api/admin.api';
import { uploadImage } from '../../api/store.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useCurrentStore } from '../../hooks/useSocket';
import { useAuthStore } from '../../stores/authStore';

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  logo: '',
  tableCount: 0,
};

export const StoreSettings = () => {
  const store = useCurrentStore();
  const updateStoreInList = useAuthStore((state) => state.updateStoreInList);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const loadData = async () => {
    if (!store?.id) return;

    try {
      setLoading(true);
      const response = await fetchStoreSettings(store.id);
      setForm({
        name: response.data.name || '',
        slug: response.data.slug || '',
        description: response.data.description || '',
        logo: response.data.logo || '',
        tableCount: response.data.tableCount ?? 0,
      });
      setSlugTouched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [store?.id]);

  const handleNameChange = (name) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !store?.id) return;

    try {
      setUploading(true);
      setError('');
      const response = await uploadImage(store.id, file, 'stores');
      setForm((prev) => ({ ...prev, logo: response.data.url }));
      setSuccess('Đã tải logo. Nhấn "Lưu cài đặt" để áp dụng.');
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
      const response = await updateStoreSettings(store.id, {
        ...form,
        tableCount: Number(form.tableCount) || 0,
      });
      updateStoreInList(store.id, {
        name: response.data.name,
        slug: response.data.slug,
      });
      setForm({
        name: response.data.name || '',
        slug: response.data.slug || '',
        description: response.data.description || '',
        logo: response.data.logo || '',
        tableCount: response.data.tableCount ?? 0,
      });
      setSuccess('Đã lưu cài đặt quán.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Cài đặt quán">
      <div className="mx-auto w-full max-w-lg">
        {loading && <LoadingSpinner />}

        {!loading && (
          <Card>
            <p className="mb-5 text-center text-sm text-ink-muted">
              Thông tin hiển thị với khách và số bàn để tạo mã QR từng bàn.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tên quán"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Song Anh Trà Quán"
                required
              />

              <div>
                <Input
                  label="Đường dẫn (slug)"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: e.target.value });
                  }}
                  placeholder="song-anh-tra-quan"
                  required
                />
                <p className="mt-1 text-xs text-ink-muted">
                  Link khách: /store/{form.slug || '...'}
                </p>
              </div>

              <Input
                label="Mô tả ngắn"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Trà sữa & trà truyền thống..."
              />

              <Input
                label="Số bàn (để in QR từng bàn)"
                type="number"
                min={0}
                max={200}
                value={form.tableCount}
                onChange={(e) => setForm({ ...form, tableCount: e.target.value })}
                placeholder="VD: 12"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Logo quán</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />

                <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-slate-50 p-5">
                  {form.logo ? (
                    <img
                      src={form.logo}
                      alt="Logo preview"
                      className="h-24 w-24 rounded-2xl border border-white bg-white object-cover p-1 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-3xl">
                      🏪
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? 'Đang tải...' : form.logo ? 'Đổi logo' : 'Thêm logo'}
                    </Button>
                    {form.logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setForm((prev) => ({ ...prev, logo: '' }))}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
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
