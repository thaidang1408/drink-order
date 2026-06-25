import { formatCurrency } from '../utils/format';

const ProductImage = ({ product, className = 'h-20 w-20' }) => (
  <div
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 ${className}`}
  >
    {product.image ? (
      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
    ) : (
      <span className="text-2xl opacity-70">🍽️</span>
    )}
  </div>
);

export const ProductCard = ({ product, onAdd }) => (
  <article className="card-interactive overflow-hidden">
    <div className="flex gap-3 p-3">
      <ProductImage product={product} className="h-[4.5rem] w-[4.5rem] rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-semibold leading-snug text-ink">{product.name}</h3>
            {product.isBestSeller && (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                Hot
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
              {product.description}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-brand-700">
            {product.hasOptions ? 'Từ ' : ''}
            {formatCurrency(product.price)}
          </span>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-sm active:scale-95"
          >
            {product.hasOptions ? 'Chọn' : '+ Thêm'}
          </button>
        </div>
      </div>
    </div>
  </article>
);

export { ProductImage };
