import { create } from 'zustand';
import { getDualLedgerAction, recordPaymentAction } from '@/actions/ledger.actions';
import type { RecordPaymentInput } from '@/lib/validations/ledger.schema';

export interface LedgerEntryModel {
  id: string;
  date: string;
  type: string;
  party: string;
  ref: string;
  sIn: number;
  sOut: number;
  sBal: number;
  iIn: number;
  iOut: number;
  iBal: number;
  note: string;
}

interface LedgerState {
  entries: LedgerEntryModel[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchLedger: () => Promise<void>;
  recordPayment: (input: RecordPaymentInput) => Promise<{ success: boolean; error?: string }>;
  exportCsv: () => void;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  entries: [],
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchLedger: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getDualLedgerAction();
    if (res.success && res.data) {
      set({ entries: res.data as LedgerEntryModel[], isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch ledger' });
    }
  },

  recordPayment: async (input: RecordPaymentInput) => {
    set({ isSubmitting: true });

    // 0ms Optimistic UI update
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    const prev = get().entries;
    const last = prev[prev.length - 1];

    const currentSBal = last ? last.sBal : 0;
    const currentIBal = last ? last.iBal : 0;

    const inrIn = input.paymentType === 'CLIENT_PAYMENT' ? input.amount : 0;
    const inrOut = input.paymentType !== 'CLIENT_PAYMENT' ? input.amount : 0;
    const newIBal = currentIBal + inrIn - inrOut;

    const optimistic: LedgerEntryModel = {
      id: `temp_${Date.now()}`,
      date: dateStr,
      type: 'Payment',
      party: input.partyName,
      ref: input.referenceNo,
      sIn: 0,
      sOut: 0,
      sBal: currentSBal,
      iIn: inrIn,
      iOut: inrOut,
      iBal: newIBal,
      note: input.remarks || `${input.paymentType} via ${input.mode}`,
    };

    set({ entries: [...prev, optimistic] });

    const res = await recordPaymentAction(input);
    if (res.success && res.data) {
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === optimistic.id ? (res.data as LedgerEntryModel) : e
        ),
        isSubmitting: false,
      }));
      return { success: true };
    } else {
      set({ entries: prev, isSubmitting: false });
      return { success: false, error: res.error || 'Failed to record payment' };
    }
  },

  exportCsv: () => {
    const list = get().entries;
    if (list.length === 0) return;

    const headers = [
      'Date',
      'Type',
      'Party',
      'Reference',
      'Silver In (g)',
      'Silver Out (g)',
      'Silver Balance (g)',
      'INR In (Rs)',
      'INR Out (Rs)',
      'INR Balance (Rs)',
      'Remarks',
    ];

    const rows = list.map((e) => [
      e.date,
      e.type,
      `"${e.party}"`,
      e.ref,
      e.sIn || 0,
      e.sOut || 0,
      e.sBal,
      e.iIn || 0,
      e.iOut || 0,
      e.iBal,
      `"${e.note.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SilverSuite_DualLedger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
}));
