import { useCallback, useEffect, useState } from 'react';
import { fetchStats } from '../../api/admin.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatCard } from '../../components/ui/StatCard';
import { useCurrentStore, useStoreSocket } from '../../hooks/useSocket';
import { playNotificationSound } from '../../utils/notificationSound';
import { SoundAlertBanner } from '../../components/admin/SoundAlertBanner';

export const AdminDashboard = () => {
  const store = useCurrentStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadStats = useCallback(async () => {
    if (!store?.id) return;

    try {
      const response = await fetchStats(store.id);
      setStats(response.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useStoreSocket({
    storeId: store?.id,
    onOrderCreated: () => {
      setLive(true);
      void playNotificationSound();
      loadStats();
    },
    onStatsUpdated: (payload) => {
      if (payload.storeId === store?.id) {
        setStats(payload.stats);
        setLive(true);
      }
    },
    onOrderStatusUpdated: () => loadStats(),
  });

  return (
    <AdminLayout title="Tổng quan">
      <SoundAlertBanner className="mb-3" />
      {live && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
          Cập nhật realtime
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {stats && (
        <>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
            Tổng quan đơn hàng
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Hoàn thành" value={stats.completedOrders} accent="text-green-600" />
            <StatCard label="Đã huỷ" value={stats.cancelledOrders} accent="text-red-600" />
            <StatCard label="Đang xử lý" value={stats.inProgressOrders} accent="text-purple-600" />
            <StatCard label="Chờ xác nhận" value={stats.pendingOrders} accent="text-amber-600" />
          </div>

          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-stone-400">
            Hôm nay
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Hoàn thành" value={stats.todayCompleted} accent="text-green-600" />
            <StatCard label="Đã huỷ" value={stats.todayCancelled} accent="text-red-600" />
            <StatCard label="Đang xử lý" value={stats.todayInProgress} accent="text-blue-600" />
            <StatCard label="Doanh thu" value={stats.todayRevenue} isCurrency accent="text-brand-600" />
          </div>

          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-stone-400">
            Doanh thu (đơn hoàn thành)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard label="Tổng doanh thu" value={stats.totalRevenue} isCurrency />
            <StatCard label="Doanh thu hôm nay" value={stats.todayRevenue} isCurrency />
          </div>
        </>
      )}

      {store && (
        <div className="card mt-6">
          <h2 className="font-semibold text-ink">{store.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Menu khách:{' '}
            <a href={`/store/${store.slug}`} className="font-medium text-brand-700 underline">
              /store/{store.slug}
            </a>
          </p>
        </div>
      )}
    </AdminLayout>
  );
};
