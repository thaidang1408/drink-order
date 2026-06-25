import { formatCurrency } from '../../utils/format';

export const StatCard = ({ label, value, sub, accent = 'text-ink', isCurrency = false }) => (
  <div className="card p-4">
    <p className="section-title">{label}</p>
    <p className={`mt-2 text-2xl font-bold tracking-tight ${accent}`}>
      {isCurrency ? formatCurrency(value) : value}
    </p>
    {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
  </div>
);
