import { z } from 'zod';

export const CreateJobOrderSchema = z.object({
  workerId: z.string().min(1, 'Select a job worker'),
  orderId: z.string().min(1, 'Select an order reference'),
  jobType: z.string().min(2, 'Job type must be specified'),
  weightSent: z.number().positive('Weight sent must be greater than 0'),
  dueDate: z.string().min(2, 'Due date is required'),
  labourCost: z.number().min(0, 'Labour cost must be 0 or greater'),
});

export type CreateJobOrderInput = z.infer<typeof CreateJobOrderSchema>;

export const ReceiveJobReturnSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  weightReturned: z.number().positive('Returned weight must be greater than 0'),
  scrapReturned: z.number().min(0, 'Scrap weight cannot be negative').default(0),
  isCompleted: z.boolean().default(true),
});

export type ReceiveJobReturnInput = z.infer<typeof ReceiveJobReturnSchema>;
