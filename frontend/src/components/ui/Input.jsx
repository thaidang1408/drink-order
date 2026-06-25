export const Input = ({ label, error, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    )}
    <input className="input-field" {...props} />
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
);
