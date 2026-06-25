import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadAdminQR, fetchAdminQRBatch } from '../../api/store.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useCurrentStore } from '../../hooks/useSocket';

export const QRDownload = () => {
  const store = useCurrentStore();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!store?.id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchAdminQRBatch(store.id);
        setBatch(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [store?.id]);

  const handleDownload = async (item) => {
    if (!store?.id) return;

    try {
      setDownloading(item.table ?? 'general');
      await downloadAdminQR(store.id, {
        table: item.table,
        slug: batch?.store?.slug || store.slug,
        label: item.label,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!batch?.items?.length) return;

    for (const item of batch.items) {
      await handleDownload(item);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  return (
    <AdminLayout title="Mã QR">
      {loading && <LoadingSpinner />}
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {batch && (
        <div className="space-y-4">
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">{batch.store.name}</p>
              <p className="text-sm text-ink-muted">
                {batch.tableCount > 0
                  ? `${batch.tableCount} bàn + 1 QR chung`
                  : 'Chưa cấu hình số bàn — chỉ có QR chung'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {batch.items.length > 1 && (
                <Button
                  variant="secondary"
                  disabled={Boolean(downloading)}
                  onClick={handleDownloadAll}
                >
                  Tải tất cả
                </Button>
              )}
              <Link to="/admin/settings">
                <Button variant="ghost">Cài đặt số bàn</Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {batch.items.map((item) => (
              <Card key={item.label} className="text-center">
                <p className="text-sm font-bold text-ink">{item.label}</p>
                <img
                  src={item.dataUrl}
                  alt={item.label}
                  className="mx-auto mt-3 w-full max-w-[200px] rounded-xl border border-border bg-white p-2"
                />
                <p className="mt-2 line-clamp-2 break-all text-[10px] text-ink-muted">
                  {item.menuUrl}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    disabled={downloading === (item.table ?? 'general')}
                    onClick={() => handleDownload(item)}
                  >
                    {downloading === (item.table ?? 'general') ? 'Đang tải...' : 'Tải PNG'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigator.clipboard?.writeText(item.menuUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-ink-muted">
            QR theo bàn tự điền số bàn khi khách đặt món. In và dán tại từng bàn.
          </p>
        </div>
      )}
    </AdminLayout>
  );
};
