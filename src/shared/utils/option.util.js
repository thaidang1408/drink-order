import { BadRequestError } from '../errors/index.js';
import { roundMoney, toNumber } from './decimal.util.js';

export const serializeOptionGroup = (group) => ({
  id: group.id,
  name: group.name,
  type: group.type,
  required: group.required,
  sortOrder: group.sortOrder,
  options: (group.options || [])
    .filter((o) => o.isActive !== false)
    .map((option) => ({
      id: option.id,
      name: option.name,
      priceAdjust: toNumber(option.priceAdjust),
      isDefault: option.isDefault,
      sortOrder: option.sortOrder,
    })),
});

export const serializeProductWithOptions = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: toNumber(product.price),
  image: product.image,
  sortOrder: product.sortOrder,
  categoryId: product.categoryId,
  hasOptions: product.hasOptions,
  isBestSeller: product.isBestSeller ?? false,
  optionGroups: (product.optionAssignments || [])
    .map((a) => a.group)
    .filter((g) => g && g.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(serializeOptionGroup),
});

export const buildOptionsLabel = (selections) =>
  selections.map((s) => s.optionName).join(' · ');

export const resolveOrderItemOptions = (product, selectedOptions = []) => {
  if (!product.hasOptions) {
    if (selectedOptions.length > 0) {
      throw new BadRequestError(`Product "${product.name}" does not support options`);
    }
    const unitPrice = toNumber(product.price);
    return { unitPrice, selections: [], optionsLabel: null, optionsJson: null };
  }

  const groups = (product.optionAssignments || [])
    .map((a) => a.group)
    .filter((g) => g && g.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (groups.length === 0) {
    throw new BadRequestError(`Product "${product.name}" has no option groups configured`);
  }

  const selectionsByGroup = new Map();

  for (const pick of selectedOptions) {
    if (selectionsByGroup.has(pick.groupId)) {
      const group = groups.find((g) => g.id === pick.groupId);
      if (group?.type === 'SINGLE') {
        throw new BadRequestError(`Group "${group.name}" only allows one selection`);
      }
    }
    const list = selectionsByGroup.get(pick.groupId) || [];
    list.push(pick);
    selectionsByGroup.set(pick.groupId, list);
  }

  const resolved = [];

  for (const group of groups) {
    const picks = selectionsByGroup.get(group.id) || [];
    const activeOptions = (group.options || []).filter((o) => o.isActive !== false);

    if (group.required && picks.length === 0) {
      const defaultOpt = activeOptions.find((o) => o.isDefault);
      if (defaultOpt) {
        picks.push({ groupId: group.id, optionId: defaultOpt.id });
      } else {
        throw new BadRequestError(`Please select "${group.name}" for ${product.name}`);
      }
    }

    if (group.type === 'SINGLE' && picks.length > 1) {
      throw new BadRequestError(`"${group.name}" only allows one option`);
    }

    for (const pick of picks) {
      const option = activeOptions.find((o) => o.id === pick.optionId);
      if (!option) {
        throw new BadRequestError(`Invalid option for "${group.name}"`);
      }
      resolved.push({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        priceAdjust: toNumber(option.priceAdjust),
      });
    }
  }

  const unitPrice = roundMoney(
    toNumber(product.price) + resolved.reduce((sum, s) => sum + s.priceAdjust, 0),
  );

  const optionsLabel = buildOptionsLabel(resolved);
  const optionsJson = JSON.stringify({ selections: resolved });

  return { unitPrice, selections: resolved, optionsLabel, optionsJson };
};
