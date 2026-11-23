import { create } from 'zustand';
import { getInvoicesAction, generateInvoiceAction } from '@/actions/billing.actions';
import type { GenerateInvoiceInput } from '@/lib/validations/invoice.schema';

export interface InvoiceLineModel {
  id: string;
  desc: string;
  fine: number;
  making: number;
  silverVal: number;
  total: number;
}

export interface InvoiceModel {
  id: string;
  no: string;
  client: string;
  city?: string;
  gst?: string;
  order: string;
  date: string;
  rateLock?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paid: number;
  outstanding: number;
  status: string;
  lines: InvoiceLineModel[];
}

interface BillingState {
  invoices: InvoiceModel[];
  selectedInvoice: InvoiceModel | null;
  invoiceOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchInvoices: () => Promise<void>;
  setSelectedInvoice: (inv: InvoiceModel | null) => void;
  setInvoiceOpen: (open: boolean) => void;
  generateInvoice: (input: GenerateInvoiceInput) => Promise<{ success: boolean; error?: string; invoiceNo?: string }>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  invoices: [],
  selectedInvoice: null,
  invoiceOpen: false,
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchInvoices: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getInvoicesAction();
    if (res.success && res.data) {
      const invs = res.data as InvoiceModel[];
      set({
        invoices: invs,
        selectedInvoice: get().selectedInvoice || invs[0] || null,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch invoices' });
    }
  },

  setSelectedInvoice: (inv) => set({ selectedInvoice: inv, invoiceOpen: !!inv }),
  setInvoiceOpen: (open) => set({ invoiceOpen: open }),

  generateInvoice: async (input: GenerateInvoiceInput) => {
    set({ isSubmitting: true });
    const res = await generateInvoiceAction(input);
    if (res.success && res.data) {
      await get().fetchInvoices();
      set({ isSubmitting: false });
      return { success: true, invoiceNo: res.data.no };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to generate invoice' };
    }
  },
}));
