import { z } from 'zod';

export const KarigarSchema = z.object({
  name: z.string().trim().min(2, 'Artisan name must be at least 2 characters').max(100),
  skill: z.string().trim().min(2, 'Skill specialty is required (e.g. Filigree · Payal)').max(100),
  wastagePct: z.coerce.number().min(0, 'Wastage percentage cannot be negative').max(15, 'Wastage % cannot exceed 15%').default(1.5),
  riskLevel: z.enum(['GREEN', 'AMBER', 'RED']).default('GREEN'),
});

export type KarigarInput = z.infer<typeof KarigarSchema>;

export const AssignWorkSchema = z.object({
  karigarId: z.string().min(1, 'Please select an artisan'),
  product: z.string().trim().min(2, 'Product name is required'),
  orderRef: z.string().trim().min(1, 'Order reference is required'),
  weightIssued: z.coerce.number().positive('Issued weight must be greater than 0'),
  expectedFine: z.coerce.number().positive('Expected fine weight must be greater than 0'),
  dueDate: z.string().trim().min(1, 'Due date is required'),
});

export type AssignWorkInput = z.infer<typeof AssignWorkSchema>;
