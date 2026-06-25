import { STATUS_COLORS } from '../../utils/constants';

export const Badge = ({ status, children, variant }) => {
  const variantClass =
    variant === 'accent'
      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
      : STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClass}`}
    >
      {children}
    </span>
  );
};
