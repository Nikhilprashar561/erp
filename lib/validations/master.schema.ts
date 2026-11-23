import { z } from 'zod';

export const CreateMasterCategorySchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(6, 'Code cannot exceed 6 characters')
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(2, 'Category name is required').trim(),
  description: z.string().optional(),
});

export type CreateMasterCategoryInput = z.infer<typeof CreateMasterCategorySchema>;

export const CreateMakingChargeSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  categoryTitle: z.string().min(2, 'Title is required').trim(),
  ratePerGram: z.number().min(0, 'Rate per gram must be non-negative'),
  minimumCharge: z.number().min(0, 'Minimum charge must be non-negative'),
  standardWastage: z.number().min(0, 'Wastage must be non-negative').max(100, 'Wastage cannot exceed 100%'),
});

export type CreateMakingChargeInput = z.infer<typeof CreateMakingChargeSchema>;
