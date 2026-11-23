import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  name: z.string().min(2, 'Employee name is required').trim(),
  role: z.string().min(2, 'Role/Designation is required').trim(),
  department: z.string().min(2, 'Department is required').trim(),
  monthlySalary: z.number().min(0, 'Monthly salary must be a positive amount'),
  joinedYear: z.string().min(4, 'Joined year is required (e.g. 2022)').max(4),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;

export const ToggleAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  attendance: z.enum(['PRESENT', 'LEAVE']),
});

export type ToggleAttendanceInput = z.infer<typeof ToggleAttendanceSchema>;
