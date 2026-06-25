import { formatCurrency } from '../utils/format';
import { HorizontalScroll } from './HorizontalScroll';
import { ProductImage } from './ProductCard';

export const BestSellerCard = ({ product, onAdd }) => (
  <button
    type="button"
    onClick={() => onAdd(product)}
    className="flex w-[9.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition active:scale-[0.98] hover:border-brand-200 hover:shadow-md"
  >
    <div className="relative">
      <ProductImage product={product} className="h-28 w-full rounded-none rounded-t-2xl" />
      <span className="absolute left-2 top-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
        Hot
      </span>
    </div>
    <div className="flex flex-1 flex-col p-3">
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{product.name}</p>
      <p className="mt-auto pt-2 text-sm font-bold text-brand-700">
        {product.hasOptions ? 'Từ ' : ''}
        {formatCurrency(product.price)}
      </p>
    </div>
  </button>
);

export const BestSellerSection = ({ products, onAdd }) => {
  if (!products?.length) return null;

  return (
    <section className="border-b border-border bg-gradient-to-b from-white to-slate-50/80 py-4">
      <div className="mb-3 flex items-end justify-between px-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>
              🔥
            </span>
            <h2 className="text-base font-bold text-ink">Món nổi bật</h2>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">Được khách order nhiều nhất</p>
        </div>
        {products.length > 2 && (
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-muted ring-1 ring-border">
            {products.length} món
          </span>
        )}
      </div>

      <HorizontalScroll className="px-4 pb-1" fadeFrom="from-slate-50" showProgress>
        {products.map((product) => (
          <BestSellerCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </HorizontalScroll>
    </section>
  );
};
