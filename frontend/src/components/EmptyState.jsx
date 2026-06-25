export const EmptyState = ({ title, description, action, icon = '📋' }) => (
  <div className="flex min-h-[32vh] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
      {icon}
    </span>
    <div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
    {action}
  </div>
);
