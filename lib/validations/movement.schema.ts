import { z } from 'zod';

export const MovementTypeEnum = z.enum(['RECEIPT', 'ISSUE', 'TRANSFER', 'RETURN', 'DISPATCH']);
export type MovementTypeType = z.infer<typeof MovementTypeEnum>;

export const CreateMovementSchema = z.object({
  movementType: MovementTypeEnum,
  fromLocation: z.string().min(1, 'Source location or party is required'),
  toLocation: z.string().min(1, 'Destination location or party is required'),
  referenceNo: z.string().min(1, 'Order, batch or transfer reference is required'),
  fineWeight: z.number().positive('Fine weight must be greater than 0'),
  createdByName: z.string().min(1, 'Authorized person name is required'),
});

export type CreateMovementInput = z.infer<typeof CreateMovementSchema>;
