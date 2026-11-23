import { z } from 'zod';

export const GenerateInvoiceSchema = z.object({
  orderId: z.string().min(1, 'Order reference is required'),
  invoiceDate: z.string().min(2, 'Invoice date is required'),
  applyGst: z.boolean().default(true),
  isInterState: z.boolean().default(false),
});

export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;

export const UpdateInvoicePaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amountPaid: z.number().positive('Payment amount must be greater than 0'),
});

export type UpdateInvoicePaymentInput = z.infer<typeof UpdateInvoicePaymentSchema>;
