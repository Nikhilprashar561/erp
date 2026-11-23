import { z } from 'zod';

export const ClientSchema = z.object({
  name: z.string().trim().min(2, 'Client name must be at least 2 characters').max(100),
  city: z.string().trim().min(2, 'City is required').max(50),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GST Number format (e.g. 24AABCM1234F1Z5)'),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  creditSilverLimit: z.coerce.number().min(0, 'Silver credit limit must be >= 0').default(1000),
  creditInrLimit: z.coerce.number().min(0, 'INR credit limit must be >= 0').default(500000),
});

export type ClientInput = z.infer<typeof ClientSchema>;
