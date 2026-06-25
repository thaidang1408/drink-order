import { useEffect, useMemo, useState } from 'react';
import {
  buildOptionsLabel,
  computeUnitPrice,
  getDefaultSelections,
} from '../utils/options';
import { formatCurrency } from '../utils/format';
import { ProductImage } from './ProductCard';

export const ProductOptionsModal = ({ product, open, onClose, onConfirm }) => {
  const [selections, setSelections] = useState([]);

  const optionGroups = product?.optionGroups ?? [];

  useEffect(() => {
    if (open && product) {
      setSelections(getDefaultSelections(optionGroups));
    }
  }, [open, product, optionGroups]);

  const unitPrice = useMemo(
    () => (product ? computeUnitPrice(product.price, optionGroups, selections) : 0),
    [product, optionGroups, selections],
  );

  const optionsLabel = useMemo(
    () => buildOptionsLabel(optionGroups, selections),
    [optionGroups, selections],
  );

  if (!open || !product) return null;

  const isSelected = (groupId, optionId) =>
    selections.some((s) => s.groupId === groupId && s.optionId === optionId);

  const handleSingleSelect = (groupId, optionId) => {
    setSelections((prev) => [
      ...prev.filter((s) => s.groupId !== groupId),
      { groupId, optionId },
    ]);
  };

  const handleMultipleToggle = (groupId, optionId) => {
    setSelections((prev) => {
      const exists = prev.some((s) => s.groupId === groupId && s.optionId === optionId);
      if (exists) {
        return prev.filter((s) => !(s.groupId === groupId && s.optionId === optionId));
      }
      return [...prev, { groupId, optionId }];
    });
  };

  const handleConfirm = () => {
    for (const group of optionGroups) {
      if (!group.required) continue;
      const hasPick = selections.some((s) => s.groupId === group.id);
      if (!hasPick) return;
    }

    onConfirm({
      options: selections,
      optionsLabel,
      unitPrice,
      basePrice: product.price,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
        style={{ boxShadow: 'var(--shadow-elevated)' }}
      >
        <div className="mb-5 flex gap-3">
          <ProductImage product={product} className="h-16 w-16" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink">{product.name}</h2>
            <p className="text-sm text-ink-muted">Chọn tuỳ chỉnh</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-fit rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-5">
          {optionGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">{group.name}</h3>
                {group.required && (
                  <span className="text-[10px] font-medium text-red-500">Bắt buộc</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const selected = isSelected(group.id, option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        group.type === 'MULTIPLE'
                          ? handleMultipleToggle(group.id, option.id)
                          : handleSingleSelect(group.id, option.id)
                      }
                      className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                        selected
                          ? 'bg-ink text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {option.name}
                      {option.priceAdjust > 0 && (
                        <span className={`ml-1 text-xs ${selected ? 'text-slate-300' : 'text-ink-muted'}`}>
                          +{formatCurrency(option.priceAdjust)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-ink-muted">Tạm tính</p>
            <p className="text-xl font-bold text-brand-700">{formatCurrency(unitPrice)}</p>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white active:scale-95"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};
