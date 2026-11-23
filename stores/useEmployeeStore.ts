import { create } from 'zustand';
import {
  getEmployeesAction,
  createEmployeeAction,
  toggleAttendanceAction,
} from '@/actions/employee.actions';
import type { CreateEmployeeInput } from '@/lib/validations/employee.schema';

export interface EmployeeModel {
  id: string;
  name: string;
  role: string;
  dept: string;
  att: 'present' | 'leave';
  joined: string;
  salary: number;
  init: string;
}

interface EmployeeState {
  cards: Array<{ label: string; amt: string; accent: string }>;
  employees: EmployeeModel[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchEmployees: () => Promise<void>;
  createEmployee: (input: CreateEmployeeInput) => Promise<{ success: boolean; error?: string }>;
  toggleAttendance: (employeeId: string, current: 'present' | 'leave') => Promise<{ success: boolean; error?: string }>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  cards: [
    { label: 'Total Staff', amt: '0', accent: '#F0F2F4' },
    { label: 'Present Today', amt: '0', accent: '#4ADE80' },
    { label: 'On Leave', amt: '0', accent: '#FFC840' },
    { label: 'Monthly Payroll', amt: '₹ 0', accent: '#C8D0D8' },
  ],
  employees: [],
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchEmployees: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getEmployeesAction();
    if (res.success && res.data) {
      set({
        cards: res.data.cards,
        employees: res.data.employees as EmployeeModel[],
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch employee roster' });
    }
  },

  createEmployee: async (input) => {
    set({ isSubmitting: true });
    const res = await createEmployeeAction(input);
    if (res.success) {
      await get().fetchEmployees();
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to create employee' };
    }
  },

  toggleAttendance: async (employeeId: string, current: 'present' | 'leave') => {
    const next = current === 'present' ? 'leave' : 'present';
    const prevList = get().employees;

    // 0ms Optimistic UI update
    set({
      employees: prevList.map((e) => (e.id === employeeId ? { ...e, att: next } : e)),
    });

    const res = await toggleAttendanceAction({
      employeeId,
      attendance: next === 'present' ? 'PRESENT' : 'LEAVE',
    });

    if (res.success) {
      await get().fetchEmployees();
      return { success: true };
    } else {
      set({ employees: prevList });
      return { success: false, error: res.error || 'Failed to toggle attendance' };
    }
  },
}));
