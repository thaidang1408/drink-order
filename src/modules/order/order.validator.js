import { z } from 'zod';

export const trackOrderParamSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Order number is required'),
});

const optionPickSchema = z.object({
  groupId: z.string().trim().min(1),
  optionId: z.string().trim().min(1),
});

const orderItemSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99'),
  options: z.array(optionPickSchema).optional().default([]),
});

export const createOrderSchema = z.object({
  storeSlug: z.string().trim().min(1, 'Store slug is required'),
  tableNumber: z.string().trim().max(20).optional(),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER']).optional().default('CASH'),
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot exceed 50 items'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

export const storeIdParamSchema = z.object({
  storeId: z.string().trim().min(1),
});

export const orderIdParamSchema = z.object({
  storeId: z.string().trim().min(1),
  orderId: z.string().trim().min(1),
});
