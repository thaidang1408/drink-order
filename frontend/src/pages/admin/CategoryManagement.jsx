import { useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../api/admin.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useCurrentStore } from '../../hooks/useSocket';

const emptyForm = { name: '', sortOrder: '0', isActive: true };

export const CategoryManagement = () => {
  const store = useCurrentStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!store?.id) return;
    const response = await fetchCategories(store.id);
    setCategories(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [store?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateCategory(store.id, editing.id, payload);
      } else {
        await createCategory(store.id, payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Xóa danh mục này? Tất cả sản phẩm trong danh mục cũng sẽ bị xóa.')) return;
    await deleteCategory(store.id, categoryId);
    await loadData();
  };

  return (
    <AdminLayout title="Danh mục">
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Thêm danh mục</Button>
      </div>

      {loading && <LoadingSpinner />}

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-900">{category.name}</p>
              <p className="text-sm text-stone-500">
                Thứ tự: {category.sortOrder} · {category.productCount} sản phẩm
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => openEdit(category)}>
                Sửa
              </Button>
              <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => handleDelete(category.id)}>
                Xóa
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Thứ tự" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Hiển thị
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
};
