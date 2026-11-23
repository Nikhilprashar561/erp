import { create } from 'zustand';
import { getBatchesAction, advanceBatchStageAction, createBatchAction } from '@/actions/production.actions';
import type { CreateBatchInput } from '@/lib/validations/production.schema';

export interface BatchModel {
  id: string;
  bid: string;
  ref: string;
  client: string;
  product: string;
  wt: number;
  stage: string;
  rawStage?: string;
  karigar: string;
  inStage: string;
  delay: boolean;
}

const STAGE_ORDER = ['melting', 'rodmaking', 'cutting', 'forming', 'polishing', 'qc', 'dispatch'];

interface ProductionState {
  batches: BatchModel[];
  productionView: 'kanban' | 'table';
  isLoading: boolean;
  isAdvancing: boolean;
  errorMessage: string | null;

  fetchBatches: () => Promise<void>;
  setProductionView: (view: 'kanban' | 'table') => void;
  advanceBatch: (batchId: string) => Promise<{ success: boolean; error?: string }>;
  createBatch: (input: CreateBatchInput) => Promise<{ success: boolean; error?: string }>;
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  batches: [],
  productionView: 'kanban',
  isLoading: false,
  isAdvancing: false,
  errorMessage: null,

  fetchBatches: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getBatchesAction();
    if (res.success && res.data) {
      set({ batches: res.data as BatchModel[], isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch batches' });
    }
  },

  setProductionView: (view) => set({ productionView: view }),

  advanceBatch: async (batchId: string) => {
    const prevBatches = get().batches;
    const current = prevBatches.find((b) => b.bid === batchId || b.id === batchId);
    if (!current) return { success: false, error: 'Batch not found' };

    const currentIdx = STAGE_ORDER.indexOf(current.stage.toLowerCase());
    if (currentIdx === -1 || currentIdx >= STAGE_ORDER.length - 1) {
      return { success: false, error: 'Batch is already in final dispatch stage' };
    }

    const nextStage = STAGE_ORDER[currentIdx + 1];

    // 0ms Optimistic Stage Advance
    set({
      batches: prevBatches.map((b) =>
        b.bid === batchId || b.id === batchId
          ? { ...b, stage: nextStage, inStage: 'just now', delay: false }
          : b
      ),
    });

    const res = await advanceBatchStageAction(batchId);
    if (!res.success) {
      // Rollback on failure
      set({ batches: prevBatches });
      return { success: false, error: res.error || 'Failed to advance batch stage' };
    }

    return { success: true };
  },

  createBatch: async (input: CreateBatchInput) => {
    set({ isLoading: true });
    const res = await createBatchAction(input);
    if (res.success && res.data) {
      await get().fetchBatches();
      return { success: true };
    } else {
      set({ isLoading: false });
      return { success: false, error: res.error || 'Failed to create batch' };
    }
  },
}));
