import { create } from 'zustand';
import { getReportsOverviewAction, generateReportDataAction } from '@/actions/reports.actions';

export interface ReportItem {
  id: string;
  name: string;
  cat: string;
  stat: string;
  desc: string;
}

interface ReportsState {
  reports: ReportItem[];
  isLoading: boolean;
  downloadingId: string | null;
  errorMessage: string | null;

  fetchReports: () => Promise<void>;
  downloadReport: (reportId: string) => Promise<{ success: boolean; filename?: string; error?: string }>;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],
  isLoading: false,
  downloadingId: null,
  errorMessage: null,

  fetchReports: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getReportsOverviewAction();
    if (res.success && res.data) {
      set({ reports: res.data as ReportItem[], isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch reports' });
    }
  },

  downloadReport: async (reportId: string) => {
    set({ downloadingId: reportId });
    const res = await generateReportDataAction(reportId);
    set({ downloadingId: null });

    if (res.success && res.csvContent && res.reportName) {
      if (typeof window !== 'undefined') {
        const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.reportName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      return { success: true, filename: res.reportName };
    } else {
      return { success: false, error: res.error || 'Failed to download report' };
    }
  },
}));
