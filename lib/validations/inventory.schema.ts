import { z } from 'zod';

export const InventoryStatusEnum = z.enum(['IN_STOCK', 'LOW', 'REORDER']);
export type InventoryStatusType = z.infer<typeof InventoryStatusEnum>;

export const CreateInventoryItemSchema = z.object({
  sku: z.string().min(3, 'SKU code must be at least 3 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  purityId: z.string().min(1, 'Purity standard is required'),
  pieces: z.number().int().min(1, 'At least 1 piece is required'),
  grossWeight: z.number().positive('Gross weight must be greater than 0'),
  fineWeight: z.number().positive('Fine weight must be greater than 0'),
  location: z.string().min(1, 'Vault or storage location is required'),
  status: InventoryStatusEnum.default('IN_STOCK'),
});

export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;
