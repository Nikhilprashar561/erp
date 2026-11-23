import { z } from 'zod';

export const ProductionStageEnum = z.enum([
  'MELTING',
  'ROD_MAKING',
  'CUTTING',
  'FORMING',
  'POLISHING',
  'QC',
  'DISPATCH',
]);

export type ProductionStageType = z.infer<typeof ProductionStageEnum>;

export const AdvanceBatchSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  lossWeight: z.number().min(0, 'Loss weight cannot be negative').default(0),
  remarks: z.string().optional(),
});

export type AdvanceBatchInput = z.infer<typeof AdvanceBatchSchema>;

export const CreateBatchSchema = z.object({
  orderId: z.string().min(1, 'Order reference is required'),
  karigarId: z.string().optional(),
  product: z.string().min(2, 'Product name must be at least 2 characters'),
  weight: z.number().positive('Gross weight must be greater than 0'),
  stage: ProductionStageEnum.default('MELTING'),
});

export type CreateBatchInput = z.infer<typeof CreateBatchSchema>;
