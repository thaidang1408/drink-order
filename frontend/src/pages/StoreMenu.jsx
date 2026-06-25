import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchStoreMenu } from '../api/menu.api';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { ProductOptionsModal } from '../components/ProductOptionsModal';
import { BestSellerSection } from '../components/BestSellerSection';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { useCartStore } from '../stores/cartStore';

export const StoreMenu = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableFromUrl = searchParams.get('table')?.trim() || '';
  const [menu, setMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optionsProduct, setOptionsProduct] = useState(null);
  const initStore = useCartStore((state) => state.initStore);
  const setTableNumber = useCartStore((state) => state.setTableNumber);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddProduct = (product) => {
    if (product.hasOptions && product.optionGroups?.length > 0) {
      setOptionsProduct(product);
      return;
    }
    addItem(product);
  };

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchStoreMenu(slug);
        setMenu(response.data);
        initStore(response.data.store, {
          tableNumber: tableFromUrl || undefined,
          tableLocked: Boolean(tableFromUrl),
        });
        if (tableFromUrl) {
          setTableNumber(tableFromUrl, true);
        }
        setActiveCategory(response.data.categories[0]?.id ?? null);
      } catch (err) {
        setError(err.message || 'Không thể tải thực đơn');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [slug, initStore, setTableNumber, tableFromUrl]);

  if (loading) {
    return (
      <Layout slug={slug} title="Thực đơn">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout slug={slug} title="Thực đơn" showCart={false}>
        <EmptyState title="Có lỗi xảy ra" description={error} icon="⚠️" />
      </Layout>
    );
  }

  const categories = menu?.categories ?? [];
  const bestSellers = menu?.bestSellers ?? [];
  const activeProducts =
    categories.find((category) => category.id === activeCategory)?.products ?? [];
  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name;

  return (
    <Layout
      slug={slug}
      store={{
        ...menu.store,
        description:
          menu.store.description?.trim() || 'Đặt món trực tiếp từ bàn — nhanh & tiện lợi',
      }}
      tableLabel={tableFromUrl ? `Bàn ${tableFromUrl}` : null}
    >
      <BestSellerSection products={bestSellers} onAdd={handleAddProduct} />

      {categories.length === 0 ? (
        <EmptyState
          title="Chưa có món"
          description="Cửa hàng đang cập nhật thực đơn."
          icon="🍽️"
        />
      ) : (
        <>
          <div className="sticky top-[4.25rem] z-10 border-b border-border bg-white/95 backdrop-blur-md">
            <HorizontalScroll className="px-4 py-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`pill snap-start ${
                    activeCategory === category.id ? 'pill-active' : 'pill-inactive'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </HorizontalScroll>
          </div>

          <div className="space-y-3 p-4 pb-6">
            <div className="flex items-baseline justify-between px-0.5">
              <p className="text-sm font-bold text-ink">{activeCategoryName}</p>
              <p className="text-xs text-ink-muted">{activeProducts.length} món</p>
            </div>
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAddProduct} />
            ))}
          </div>
        </>
      )}

      <ProductOptionsModal
        product={optionsProduct}
        open={Boolean(optionsProduct)}
        onClose={() => setOptionsProduct(null)}
        onConfirm={(config) => addItem(optionsProduct, config)}
      />
    </Layout>
  );
};
