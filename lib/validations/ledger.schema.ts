import { z } from 'zod';

export const PaymentTypeEnum = z.enum(['CLIENT_PAYMENT', 'KARIGAR_WAGE', 'EXPENSE_PAYMENT']);
export type PaymentType = z.infer<typeof PaymentTypeEnum>;

export const RecordPaymentSchema = z.object({
  partyName: z.string().min(1, 'Party or client name is required'),
  referenceNo: z.string().min(1, 'Reference number or voucher is required'),
  paymentType: PaymentTypeEnum.default('CLIENT_PAYMENT'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  mode: z.enum(['NEFT_RTGS', 'UPI', 'CASH', 'CHEQUE']).default('NEFT_RTGS'),
  remarks: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

export const RecordSilverReceiptSchema = z.object({
  partyName: z.string().min(1, 'Party or client name is required'),
  referenceNo: z.string().min(1, 'Order reference is required'),
  silverWeight: z.number().positive('Silver weight must be greater than 0'),
  remarks: z.string().optional(),
});

export type RecordSilverReceiptInput = z.infer<typeof RecordSilverReceiptSchema>;
