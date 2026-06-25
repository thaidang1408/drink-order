import { z } from 'zod';

export const createOptionGroupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  type: z.enum(['SINGLE', 'MULTIPLE']).optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateOptionGroupSchema = createOptionGroupSchema.partial();

export const optionGroupIdParamSchema = z.object({
  storeId: z.string().trim().min(1),
  groupId: z.string().trim().min(1),
});

export const createOptionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  priceAdjust: z.number().min(0).optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateOptionSchema = createOptionSchema.partial();

export const optionIdParamSchema = z.object({
  storeId: z.string().trim().min(1),
  groupId: z.string().trim().min(1),
  optionId: z.string().trim().min(1),
});
