import { z } from 'zod';

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Store slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid store slug format'),
});

export const updatePaymentSettingsSchema = z.object({
  bankQrImage: z.string().url().optional().or(z.literal('')),
  bankName: z.string().trim().max(100).optional().or(z.literal('')),
  bankAccountNo: z.string().trim().max(50).optional().or(z.literal('')),
  bankAccountName: z.string().trim().max(100).optional().or(z.literal('')),
});

export const updateStoreSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Tên quán không được để trống').max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  tableCount: z.coerce.number().int().min(0).max(200),
});

export const tableQuerySchema = z.object({
  table: z.string().trim().min(1).max(20).optional(),
});
