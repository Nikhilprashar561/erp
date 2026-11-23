import { create } from 'zustand';
import { getAnalyticsDataAction } from '@/actions/analytics.actions';

export interface AnalyticsData {
  kpis: Array<{
    label: string;
    val: string;
    delta: string;
    dColor: string;
  }>;
  months: string[];
  revenueData: number[];
  costData: number[];
  silverIn: number[];
  silverOut: number[];
  marginData: number[];
  prodLabels: string[];
  prodBarData: number[];
}

interface AnalyticsState {
  period: 'Year' | 'Quarter';
  data: AnalyticsData | null;
  isLoading: boolean;
  errorMessage: string | null;

  setPeriod: (period: 'Year' | 'Quarter') => void;
  fetchAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  period: 'Year',
  data: null,
  isLoading: false,
  errorMessage: null,

  setPeriod: (period) => {
    set({ period });
    get().fetchAnalytics();
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getAnalyticsDataAction(get().period);
    if (res.success && res.data) {
      set({ data: res.data as AnalyticsData, isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch analytics' });
    }
  },
}));
