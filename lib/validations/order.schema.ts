import { z } from 'zod';

export const OrderItemInputSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  grossWeight: z.coerce.number().positive('Gross weight must be greater than 0'),
  fineWeight: z.coerce.number().positive('Fine weight must be greater than 0'),
  makingChargeRate: z.coerce.number().min(0, 'Making charge cannot be negative').default(20),
});

export const CreateOrderSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  dueDate: z.string().trim().min(1, 'Due date is required (e.g. 24 Jun)'),
  rateLocked: z.coerce.number().positive('Rate lock must be greater than 0'),
  items: z.array(OrderItemInputSchema).min(1, 'At least one product item is required'),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum(['PRODUCTION', 'QC', 'DISPATCHED', 'OVERDUE', 'HOLD', 'COMPLETED', 'RETURNED', 'PARTIAL']),
});

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
