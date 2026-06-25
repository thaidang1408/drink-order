import { useEffect, useState } from 'react';
import {
  isSoundEnabled,
  isSoundUnlocked,
  playNotificationSound,
  setSoundEnabled,
  unlockNotificationSound,
} from '../../utils/notificationSound';

export const SoundAlertBanner = ({ className = '' }) => {
  const [enabled, setEnabled] = useState(() => isSoundEnabled());
  const [unlocked, setUnlocked] = useState(() => isSoundUnlocked());
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!enabled || unlocked) return undefined;

    const tryUnlock = async () => {
      const ok = await unlockNotificationSound();
      if (ok) {
        setUnlocked(true);
        setEnabled(true);
      }
    };

    const onPointerDown = () => {
      tryUnlock();
    };

    window.addEventListener('pointerdown', onPointerDown, { once: true });
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [enabled, unlocked]);

  const handleToggle = async () => {
    if (enabled && unlocked) {
      setSoundEnabled(false);
      setEnabled(false);
      setUnlocked(false);
      return;
    }

    setActivating(true);
    const ok = await unlockNotificationSound();
    setEnabled(ok);
    setUnlocked(ok);
    setActivating(false);
  };

  const handleTest = async () => {
    setActivating(true);
    await playNotificationSound();
    setActivating(false);
  };

  if (enabled && unlocked) {
    return (
      <div
        className={`flex items-center justify-between gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs ${className}`}
      >
        <span className="flex items-center gap-2 font-medium text-ink">
          <span aria-hidden>🔊</span>
          Âm báo đơn mới đã bật
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={activating}
            className="rounded-lg px-2.5 py-1 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Thử
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-lg px-2.5 py-1 font-semibold text-ink-muted hover:bg-slate-100"
          >
            Tắt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <span className="font-medium text-amber-900">
        🔇 Bật âm thanh để nghe khi có đơn mới (trình duyệt yêu cầu bấm một lần)
      </span>
      <button
        type="button"
        onClick={handleToggle}
        disabled={activating}
        className="shrink-0 rounded-lg bg-ink px-3 py-1.5 font-semibold text-white"
      >
        {activating ? 'Đang bật...' : 'Bật âm thanh'}
      </button>
    </div>
  );
};
