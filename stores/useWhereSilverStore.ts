import { create } from 'zustand';
import { getSilverLocationsAction, reconcileSilverLocationsAction } from '@/actions/wheresilver.actions';

export interface SilverLocationModel {
  id: string;
  type: string;
  party: string;
  amt: number;
  since: string;
  aging: number;
}

export type WhereSilverFilter = 'All' | 'Factory' | 'Karigar' | 'Job Worker';

interface WhereSilverState {
  locations: SilverLocationModel[];
  filter: WhereSilverFilter;
  isLoading: boolean;
  isReconciling: boolean;
  errorMessage: string | null;

  fetchLocations: () => Promise<void>;
  setFilter: (filter: WhereSilverFilter) => void;
  reconcileStock: () => Promise<{ success: boolean; error?: string }>;
}

export const useWhereSilverStore = create<WhereSilverState>((set, get) => ({
  locations: [],
  filter: 'All',
  isLoading: false,
  isReconciling: false,
  errorMessage: null,

  fetchLocations: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getSilverLocationsAction();
    if (res.success && res.data) {
      set({ locations: res.data as SilverLocationModel[], isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch silver locations' });
    }
  },

  setFilter: (filter: WhereSilverFilter) => set({ filter }),

  reconcileStock: async () => {
    set({ isReconciling: true });
    const res = await reconcileSilverLocationsAction();
    if (res.success) {
      await get().fetchLocations();
      set({ isReconciling: false });
      return { success: true };
    } else {
      set({ isReconciling: false });
      return { success: false, error: res.error || 'Failed to reconcile stock' };
    }
  },
}));
