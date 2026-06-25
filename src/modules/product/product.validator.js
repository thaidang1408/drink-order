import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  description: z.string().trim().max(1000).optional(),
  price: z.number().positive('Price must be greater than 0'),
  image: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().trim().min(1, 'Category is required'),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  hasOptions: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  optionGroupIds: z.array(z.string().trim().min(1)).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  storeId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
});
