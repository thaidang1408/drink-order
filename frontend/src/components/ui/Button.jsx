export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    primary:
      'bg-ink text-white shadow-sm hover:bg-slate-800 active:bg-slate-900 disabled:hover:bg-ink',
    secondary:
      'bg-white text-ink ring-1 ring-border hover:bg-slate-50 active:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent text-ink-muted hover:bg-slate-100 hover:text-ink',
    accent: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-700',
  };

  const sizes = {
    sm: 'rounded-lg px-3 py-1.5 text-xs',
    md: 'rounded-xl px-4 py-2.5 text-sm',
    lg: 'rounded-xl px-5 py-3 text-sm',
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
