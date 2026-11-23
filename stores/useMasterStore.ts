import { create } from 'zustand';
import {
  getMasterDataAction,
  createMasterCategoryAction,
  createMakingChargeAction,
} from '@/actions/master.actions';
import type {
  CreateMasterCategoryInput,
  CreateMakingChargeInput,
} from '@/lib/validations/master.schema';

export interface MasterCategoryModel {
  id: string;
  code: string;
  name: string;
  desc: string;
}

export interface MasterPurityModel {
  id: string;
  code: string;
  std: string;
  use: string;
  pct: number;
}

export interface MasterMakingChargeModel {
  id: string;
  cat: string;
  rate: string;
  min: string;
  wastage: string;
}

export interface MasterJobTypeModel {
  id: string;
  type: string;
  desc: string;
}

export interface MasterUnitModel {
  name: string;
  code: string;
  basis: string;
}

interface MasterState {
  activeTab: string;
  categories: MasterCategoryModel[];
  purity: MasterPurityModel[];
  making: MasterMakingChargeModel[];
  jobtypes: MasterJobTypeModel[];
  units: MasterUnitModel[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  setActiveTab: (tab: string) => void;
  fetchMasterData: () => Promise<void>;
  createCategory: (input: CreateMasterCategoryInput) => Promise<{ success: boolean; error?: string }>;
  createMakingCharge: (input: CreateMakingChargeInput) => Promise<{ success: boolean; error?: string }>;
}

export const useMasterStore = create<MasterState>((set, get) => ({
  activeTab: 'categories',
  categories: [],
  purity: [],
  making: [],
  jobtypes: [],
  units: [],
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchMasterData: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getMasterDataAction();
    if (res.success && res.data) {
      set({
        categories: res.data.categories,
        purity: res.data.purity,
        making: res.data.making,
        jobtypes: res.data.jobtypes,
        units: res.data.units,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch master data' });
    }
  },

  createCategory: async (input) => {
    set({ isSubmitting: true });
    const res = await createMasterCategoryAction(input);
    if (res.success) {
      await get().fetchMasterData();
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to create category' };
    }
  },

  createMakingCharge: async (input) => {
    set({ isSubmitting: true });
    const res = await createMakingChargeAction(input);
    if (res.success) {
      await get().fetchMasterData();
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to create making charge' };
    }
  },
}));
