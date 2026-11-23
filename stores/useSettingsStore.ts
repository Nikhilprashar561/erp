import { create } from 'zustand';
import {
  getCompanyProfileAction,
  updateCompanyProfileAction,
  updateMcxRateAction,
} from '@/actions/settings.actions';
import type { UpdateCompanyProfileInput } from '@/lib/validations/settings.schema';

export interface CompanyProfileModel {
  id?: string;
  name: string;
  proprietor: string;
  location: string;
  gstNumber: string;
  udyamNumber: string;
  mcxRateBase: number;
  autoBills: boolean;
  twoFactorAuth: boolean;
}

interface SettingsState {
  settingsTab: string;
  profile: CompanyProfileModel | null;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  setSettingsTab: (tab: string) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (input: UpdateCompanyProfileInput) => Promise<{ success: boolean; error?: string }>;
  updateMcxRate: (rate: number) => Promise<{ success: boolean; error?: string }>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settingsTab: 'company',
  profile: null,
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  setSettingsTab: (tab) => set({ settingsTab: tab }),

  fetchProfile: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getCompanyProfileAction();
    if (res.success && res.data) {
      set({ profile: res.data as CompanyProfileModel, isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch settings' });
    }
  },

  updateProfile: async (input) => {
    set({ isSubmitting: true });
    // Optimistic UI
    const prev = get().profile;
    set({ profile: { ...(prev || {}), ...input } as CompanyProfileModel });

    const res = await updateCompanyProfileAction(input);
    if (res.success) {
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ profile: prev, isSubmitting: false });
      return { success: false, error: res.error || 'Failed to update profile' };
    }
  },

  updateMcxRate: async (rate) => {
    const res = await updateMcxRateAction({ rate });
    if (res.success) {
      if (get().profile) {
        set({ profile: { ...get().profile!, mcxRateBase: rate } });
      }
      return { success: true };
    } else {
      return { success: false, error: res.error || 'Failed to update MCX rate' };
    }
  },
}));
