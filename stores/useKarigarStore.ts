import { create } from 'zustand';
import { getKarigarsAction, createKarigarAction, assignWorkAction } from '@/actions/karigar.actions';
import type { KarigarInput, AssignWorkInput } from '@/lib/validations/karigar.schema';

export interface KarigarPieceModel {
  pid: string;
  ref: string;
  product: string;
  issued: number;
  exp: number;
  due: string;
  status: string;
}

export interface KarigarModel {
  id: string;
  karigarCode: string;
  name: string;
  skill: string;
  held: number;
  pieces: number;
  wastage: number;
  payable: number;
  risk: 'green' | 'amber' | 'red';
  piecesList: KarigarPieceModel[];
}

interface KarigarState {
  karigars: KarigarModel[];
  selectedKarigarId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  // Actions
  fetchKarigars: () => Promise<void>;
  setSelectedKarigarId: (id: string) => void;
  createKarigar: (input: KarigarInput) => Promise<{ success: boolean; error?: string }>;
  assignWork: (input: AssignWorkInput) => Promise<{ success: boolean; error?: string }>;
}

export const useKarigarStore = create<KarigarState>((set, get) => ({
  karigars: [],
  selectedKarigarId: null,
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchKarigars: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getKarigarsAction();
    if (res.success && res.data) {
      set({
        karigars: res.data as KarigarModel[],
        selectedKarigarId: get().selectedKarigarId || res.data[0]?.id || null,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch karigars' });
    }
  },

  setSelectedKarigarId: (id: string) => set({ selectedKarigarId: id }),

  createKarigar: async (input: KarigarInput) => {
    set({ isSubmitting: true });

    // Optimistic record
    const tempId = `k_temp_${Date.now()}`;
    const optimisticKarigar: KarigarModel = {
      id: tempId,
      karigarCode: tempId,
      name: input.name,
      skill: input.skill,
      held: 0,
      pieces: 0,
      wastage: input.wastagePct,
      payable: 0,
      risk: input.riskLevel.toLowerCase() as 'green' | 'amber' | 'red',
      piecesList: [],
    };

    const prev = get().karigars;
    set({ karigars: [optimisticKarigar, ...prev], selectedKarigarId: tempId });

    const res = await createKarigarAction(input);
    if (res.success && res.data) {
      set((state) => ({
        karigars: state.karigars.map((k) => (k.id === tempId ? (res.data as KarigarModel) : k)),
        selectedKarigarId: res.data!.id,
        isSubmitting: false,
      }));
      return { success: true };
    } else {
      set({ karigars: prev, selectedKarigarId: prev[0]?.id || null, isSubmitting: false });
      return { success: false, error: res.error || 'Database write failed' };
    }
  },

  assignWork: async (input: AssignWorkInput) => {
    set({ isSubmitting: true });
    const res = await assignWorkAction(input);
    if (res.success) {
      // Refetch fresh artisan statistics
      await get().fetchKarigars();
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to assign work' };
    }
  },
}));
