import { create } from 'zustand';
import { getDashboardMetricsAction } from '@/actions/dashboard.actions';

export interface DashboardMetrics {
  kpi: {
    todayOrdersCount: number;
    todayOrdersWeight: number;
    todayOrdersValue: number;
    totalCirculationSilver: number;
    totalSilverIssued: number;
    totalSilverReceived: number;
    totalSilverOutstanding: number;
    totalInrOutstanding: number;
    ordersInProduction: number;
    outsourcedPending: number;
    pendingQcDispatch: number;
    todaysCollections: number;
    profitThisMonth: number;
  };
  chart: {
    inData: number[];
    outData: number[];
  };
  topClients: Array<{
    id: string;
    name: string;
    city: string;
    ordersCount: number;
    silverOutstanding: number;
    inrOutstanding: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'danger' | 'warning' | 'info';
    title: string;
    desc: string;
  }>;
  activities: Array<{
    id: string;
    message: string;
    timeDisplay: string;
    tagColor: string;
    referenceNo?: string | null;
  }>;
}

export const DEFAULT_CARD_ORDER = [
  'kpi-todays-orders',
  'kpi-silver-issued',
  'kpi-silver-received',
  'kpi-outstanding-silver',
  'kpi-outstanding-inr',
  'ops-orders-in-production',
  'ops-outsourced-pending',
  'ops-pending-qc-dispatch',
  'fin-todays-collections',
  'fin-profit-this-month',
  'fin-silver-movement-30d',
  'intel-top-clients',
  'intel-alert-centre',
  'intel-recent-activity',
];

interface DashboardState {
  metrics: DashboardMetrics | null;
  cardOrder: string[];
  isLoading: boolean;
  errorMessage: string | null;

  fetchMetrics: () => Promise<void>;
  setCardOrder: (order: string[]) => void;
  resetCardOrder: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  cardOrder: DEFAULT_CARD_ORDER,
  isLoading: false,
  errorMessage: null,

  fetchMetrics: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getDashboardMetricsAction();
    if (res.success && res.data) {
      set({ metrics: res.data as DashboardMetrics, isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch dashboard metrics' });
    }
  },

  setCardOrder: (order) => {
    set({ cardOrder: order });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('silversuite_dashboard_layout_v1', JSON.stringify(order));
      } catch {}
    }
  },

  resetCardOrder: () => {
    set({ cardOrder: DEFAULT_CARD_ORDER });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('silversuite_dashboard_layout_v1');
      } catch {}
    }
  },
}));
