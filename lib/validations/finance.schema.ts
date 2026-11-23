import { z } from 'zod';

export const CreateVoucherSchema = z.object({
  category: z.string().min(1, 'Expense category is required'),
  amount: z.number().positive('Voucher amount must be greater than 0'),
  voucherType: z.enum(['DEBIT', 'CREDIT']).default('DEBIT'),
  paymentMode: z.enum(['BANK', 'CASH']).default('BANK'),
  description: z.string().min(2, 'Description or remarks is required'),
});

export type CreateVoucherInput = z.infer<typeof CreateVoucherSchema>;
