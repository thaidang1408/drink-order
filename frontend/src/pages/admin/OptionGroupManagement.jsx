import { useEffect, useState } from 'react';
import {
  createOption,
  createOptionGroup,
  deleteOption,
  deleteOptionGroup,
  fetchOptionGroups,
  updateOption,
  updateOptionGroup,
} from '../../api/admin.api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useCurrentStore } from '../../hooks/useSocket';
import { formatCurrency } from '../../utils/format';

const emptyGroupForm = {
  name: '',
  type: 'SINGLE',
  required: true,
  sortOrder: '0',
  isActive: true,
};

const emptyOptionForm = {
  name: '',
  priceAdjust: '0',
  isDefault: false,
  sortOrder: '0',
  isActive: true,
};

const typeLabels = {
  SINGLE: 'Chọn một',
  MULTIPLE: 'Chọn nhiều',
};

export const OptionGroupManagement = () => {
  const store = useCurrentStore();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [optionForm, setOptionForm] = useState(emptyOptionForm);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!store?.id) return;
    const response = await fetchOptionGroups(store.id);
    setGroups(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [store?.id]);

  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm(emptyGroupForm);
    setError('');
    setGroupModalOpen(true);
  };

  const openEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      type: group.type,
      required: group.required,
      sortOrder: String(group.sortOrder),
      isActive: group.isActive,
    });
    setError('');
    setGroupModalOpen(true);
  };

  const openCreateOption = (groupId) => {
    setActiveGroupId(groupId);
    setEditingOption(null);
    setOptionForm(emptyOptionForm);
    setError('');
    setOptionModalOpen(true);
  };

  const openEditOption = (groupId, option) => {
    setActiveGroupId(groupId);
    setEditingOption(option);
    setOptionForm({
      name: option.name,
      priceAdjust: String(option.priceAdjust),
      isDefault: option.isDefault,
      sortOrder: String(option.sortOrder),
      isActive: option.isActive,
    });
    setError('');
    setOptionModalOpen(true);
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: groupForm.name,
      type: groupForm.type,
      required: groupForm.required,
      sortOrder: Number(groupForm.sortOrder),
      isActive: groupForm.isActive,
    };

    try {
      if (editingGroup) {
        await updateOptionGroup(store.id, editingGroup.id, payload);
      } else {
        await createOptionGroup(store.id, payload);
      }
      setGroupModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOptionSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: optionForm.name,
      priceAdjust: Number(optionForm.priceAdjust),
      isDefault: optionForm.isDefault,
      sortOrder: Number(optionForm.sortOrder),
      isActive: optionForm.isActive,
    };

    try {
      if (editingOption) {
        await updateOption(store.id, activeGroupId, editingOption.id, payload);
      } else {
        await createOption(store.id, activeGroupId, payload);
      }
      setOptionModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Xóa nhóm tuỳ chọn này? Các sản phẩm đang dùng sẽ mất liên kết.')) return;
    await deleteOptionGroup(store.id, groupId);
    await loadData();
  };

  const handleDeleteOption = async (groupId, optionId) => {
    if (!confirm('Xóa tuỳ chọn này?')) return;
    await deleteOption(store.id, groupId, optionId);
    await loadData();
  };

  return (
    <AdminLayout title="Tuỳ chọn đồ uống">
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateGroup}>+ Thêm nhóm</Button>
      </div>

      {loading && <LoadingSpinner />}

      <div className="space-y-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{group.name}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {typeLabels[group.type]} · {group.required ? 'Bắt buộc' : 'Tuỳ chọn'} · Thứ tự{' '}
                  {group.sortOrder} · {group.productCount} sản phẩm
                </p>
                {!group.isActive && (
                  <span className="mt-1 inline-block text-xs text-amber-600">Đang ẩn</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => openEditGroup(group)}
                >
                  Sửa nhóm
                </Button>
                <Button
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => openCreateOption(group.id)}
                >
                  + Tuỳ chọn
                </Button>
                <Button
                  variant="danger"
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  Xóa
                </Button>
              </div>
            </div>

            {group.options.length > 0 ? (
              <ul className="mt-4 space-y-2 border-t border-stone-100 pt-3">
                {group.options.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {option.name}
                        {option.isDefault && (
                          <span className="ml-2 text-xs text-brand-600">Mặc định</span>
                        )}
                        {!option.isActive && (
                          <span className="ml-2 text-xs text-stone-400">Ẩn</span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500">
                        {option.priceAdjust > 0
                          ? `+${formatCurrency(option.priceAdjust)}`
                          : 'Không phụ thu'}
                        {' · '}Thứ tự {option.sortOrder}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => openEditOption(group.id, option)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => handleDeleteOption(group.id, option.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone-400">Chưa có tuỳ chọn trong nhóm này.</p>
            )}
          </Card>
        ))}

        {!loading && groups.length === 0 && (
          <p className="text-center text-sm text-stone-500">
            Chưa có nhóm tuỳ chọn. Tạo nhóm Size, Đường, Đá, Topping để gán cho đồ uống.
          </p>
        )}
      </div>

      <Modal
        open={groupModalOpen}
        title={editingGroup ? 'Sửa nhóm tuỳ chọn' : 'Thêm nhóm tuỳ chọn'}
        onClose={() => setGroupModalOpen(false)}
      >
        <form onSubmit={handleGroupSubmit} className="space-y-3">
          <Input
            label="Tên nhóm"
            value={groupForm.name}
            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
            placeholder="VD: Size, Đường, Đá"
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Kiểu chọn</label>
            <select
              value={groupForm.type}
              onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
            >
              <option value="SINGLE">Chọn một</option>
              <option value="MULTIPLE">Chọn nhiều</option>
            </select>
          </div>
          <Input
            label="Thứ tự"
            type="number"
            value={groupForm.sortOrder}
            onChange={(e) => setGroupForm({ ...groupForm, sortOrder: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={groupForm.required}
              onChange={(e) => setGroupForm({ ...groupForm, required: e.target.checked })}
            />
            Bắt buộc chọn
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={groupForm.isActive}
              onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.checked })}
            />
            Hiển thị
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            {editingGroup ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </form>
      </Modal>

      <Modal
        open={optionModalOpen}
        title={editingOption ? 'Sửa tuỳ chọn' : 'Thêm tuỳ chọn'}
        onClose={() => setOptionModalOpen(false)}
      >
        <form onSubmit={handleOptionSubmit} className="space-y-3">
          <Input
            label="Tên tuỳ chọn"
            value={optionForm.name}
            onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
            placeholder="VD: Size M, 50% đường"
            required
          />
          <Input
            label="Phụ thu (VND)"
            type="number"
            min="0"
            value={optionForm.priceAdjust}
            onChange={(e) => setOptionForm({ ...optionForm, priceAdjust: e.target.value })}
          />
          <Input
            label="Thứ tự"
            type="number"
            value={optionForm.sortOrder}
            onChange={(e) => setOptionForm({ ...optionForm, sortOrder: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={optionForm.isDefault}
              onChange={(e) => setOptionForm({ ...optionForm, isDefault: e.target.checked })}
            />
            Mặc định khi khách chọn
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={optionForm.isActive}
              onChange={(e) => setOptionForm({ ...optionForm, isActive: e.target.checked })}
            />
            Hiển thị
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            {editingOption ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
};
