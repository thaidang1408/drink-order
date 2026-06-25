export const LoadingSpinner = ({ label = 'Đang tải...' }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-ink-muted">
    <div className="relative h-11 w-11">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
    </div>
    <p className="text-sm font-medium">{label}</p>
  </div>
);
