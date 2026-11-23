import { z } from 'zod';

export const UpdateCompanyProfileSchema = z.object({
  name: z.string().min(2, 'Company name is required').trim(),
  proprietor: z.string().min(2, 'Proprietor name is required').trim(),
  location: z.string().min(2, 'Location is required').trim(),
  gstNumber: z
    .string()
    .min(15, 'GSTIN must be 15 characters')
    .max(15, 'GSTIN must be 15 characters')
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .transform((s) => s.trim().toUpperCase()),
  udyamNumber: z.string().min(5, 'MSME/Udyam number is required').trim(),
  mcxRateBase: z.number().min(1000, 'MCX base rate must be realistic').max(200000),
  autoBills: z.boolean().default(true),
  twoFactorAuth: z.boolean().default(false),
});

export type UpdateCompanyProfileInput = z.infer<typeof UpdateCompanyProfileSchema>;

export const UpdateMcxRateSchema = z.object({
  rate: z.number().min(1000, 'Invalid rate').max(200000),
});

export type UpdateMcxRateInput = z.infer<typeof UpdateMcxRateSchema>;
