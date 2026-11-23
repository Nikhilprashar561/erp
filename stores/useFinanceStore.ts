import { create } from 'zustand';
import { getFinancialOverviewAction, recordExpenseVoucherAction } from '@/actions/finance.actions';
import type { CreateVoucherInput } from '@/lib/validations/finance.schema';

export interface ReceivableModel {
  client: string;
  cur: number;
  d30: number;
  d60: number;
  d90: number;
  total: number;
}

export interface ExpenseModel {
  cat: string;
  amt: number;
  pct: number;
}

interface FinanceState {
  cards: Array<{ label: string; amt: string; accent: string }>;
  receivables: ReceivableModel[];
  expenses: ExpenseModel[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchOverview: () => Promise<void>;
  recordVoucher: (input: CreateVoucherInput) => Promise<{ success: boolean; error?: string }>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  cards: [
    { label: 'Cash in Hand', amt: '₹ 3.84 L', accent: '#F0F2F4' },
    { label: 'Bank Balance', amt: '₹ 42.60 L', accent: '#C8D0D8' },
    { label: 'Receivables', amt: '₹ 11.34 L', accent: '#FFC840' },
    { label: 'Monthly Expenses', amt: '₹ 12.31 L', accent: '#F87171' },
  ],
  receivables: [],
  expenses: [],
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchOverview: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getFinancialOverviewAction();
    if (res.success && res.data) {
      set({
        cards: res.data.cards,
        receivables: res.data.receivables,
        expenses: res.data.expenses,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch financial overview' });
    }
  },

  recordVoucher: async (input: CreateVoucherInput) => {
    set({ isSubmitting: true });
    const res = await recordExpenseVoucherAction(input);
    if (res.success) {
      await get().fetchOverview();
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to record voucher' };
    }
  },
}));
