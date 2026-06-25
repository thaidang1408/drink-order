import { useEffect, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchOptionGroups,
  fetchProducts,
  updateProduct,
} from '../../api/admin.api';
import { uploadImage } from '../../api/store.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useCurrentStore } from '../../hooks/useSocket';
import { formatCurrency } from '../../utils/format';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  image: '',
  isActive: true,
  isBestSeller: false,
  hasOptions: false,
  optionGroupIds: [],
};

export const ProductManagement = () => {
  const store = useCurrentStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [optionGroups, setOptionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    if (!store?.id) return;

    const [productsRes, categoriesRes, optionGroupsRes] = await Promise.all([
      fetchProducts(store.id),
      fetchCategories(store.id),
      fetchOptionGroups(store.id),
    ]);

    setProducts(productsRes.data);
    setCategories(categoriesRes.data);
    setOptionGroups(optionGroupsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [store?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      categoryId: product.categoryId,
      image: product.image || '',
      isActive: product.isActive,
      isBestSeller: product.isBestSeller ?? false,
      hasOptions: product.hasOptions,
      optionGroupIds: product.optionGroupIds || [],
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !store?.id) return;

    try {
      setUploading(true);
      const response = await uploadImage(store.id, file);
      setForm((prev) => ({ ...prev, image: response.data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      categoryId: form.categoryId,
      image: form.image || undefined,
      isActive: form.isActive,
      isBestSeller: form.isBestSeller,
      hasOptions: form.hasOptions,
      optionGroupIds: form.hasOptions ? form.optionGroupIds : [],
    };

    try {
      if (editing) {
        await updateProduct(store.id, editing.id, payload);
      } else {
        await createProduct(store.id, payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await deleteProduct(store.id, productId);
    await loadData();
  };

  const toggleOptionGroup = (groupId) => {
    setForm((prev) => {
      const selected = prev.optionGroupIds.includes(groupId);
      return {
        ...prev,
        optionGroupIds: selected
          ? prev.optionGroupIds.filter((id) => id !== groupId)
          : [...prev.optionGroupIds, groupId],
      };
    });
  };

  return (
    <AdminLayout title="Sản phẩm">
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Thêm sản phẩm</Button>
      </div>

      {loading && <LoadingSpinner />}

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-900">{product.name}</p>
              <p className="text-sm text-stone-500">{product.categoryName}</p>
              <p className="font-bold text-brand-600">{formatCurrency(product.price)}</p>
              {product.hasOptions && (
                <p className="text-xs text-brand-500">Có tuỳ chọn đồ uống</p>
              )}
              {product.isBestSeller && (
                <p className="text-xs font-semibold text-amber-600">Best Seller</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => openEdit(product)}>
                Sửa
              </Button>
              <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => handleDelete(product.id)}>
                Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Giá (VND)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Danh mục</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Đang bán
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
            />
            Best Seller (hiển thị mục nổi bật)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.hasOptions}
              onChange={(e) =>
                setForm({
                  ...form,
                  hasOptions: e.target.checked,
                  optionGroupIds: e.target.checked ? form.optionGroupIds : [],
                })
              }
            />
            Có tuỳ chọn (size, đường, đá...)
          </label>
          {form.hasOptions && (
            <div>
              <p className="mb-2 text-sm font-medium text-stone-700">Nhóm tuỳ chọn áp dụng</p>
              {optionGroups.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Chưa có nhóm tuỳ chọn. Tạo tại mục &quot;Tuỳ chọn&quot; trước.
                </p>
              ) : (
                <div className="space-y-2 rounded-xl border border-stone-200 p-3">
                  {optionGroups.map((group) => (
                    <label key={group.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.optionGroupIds.includes(group.id)}
                        onChange={() => toggleOptionGroup(group.id)}
                      />
                      {group.name}
                      <span className="text-xs text-stone-400">
                        ({group.type === 'MULTIPLE' ? 'nhiều' : 'một'})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Ảnh sản phẩm</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            {uploading && <p className="mt-1 text-xs text-stone-500">Đang tải ảnh...</p>}
            {form.image && (
              <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 rounded-lg object-cover" />
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
};
