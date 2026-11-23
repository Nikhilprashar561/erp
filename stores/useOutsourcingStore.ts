import { create } from 'zustand';
import { getJobWorkersAction, createJobOrderAction, receiveJobReturnAction } from '@/actions/outsourcing.actions';
import type { CreateJobOrderInput, ReceiveJobReturnInput } from '@/lib/validations/outsourcing.schema';

export interface JobWorkerModel {
  id: string;
  code: string;
  name: string;
  spec: string;
  held: number;
  active: number;
  overdue: number;
  risk: 'green' | 'amber' | 'red';
}

export interface OutsourceJobModel {
  id: string;
  jid: string;
  ref: string;
  jtype: string;
  sent: number;
  ret: number;
  due: string;
  status: string;
  labour: number;
}

interface OutsourcingState {
  workers: JobWorkerModel[];
  jobsByWorker: Record<string, OutsourceJobModel[]>;
  selectedWorkerId: string;
  drawerJob: OutsourceJobModel | null;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchWorkersAndJobs: () => Promise<void>;
  setSelectedWorker: (id: string) => void;
  setDrawerJob: (job: OutsourceJobModel | null) => void;
  recordJobReturn: (input: ReceiveJobReturnInput) => Promise<{ success: boolean; error?: string }>;
  createJobOrder: (input: CreateJobOrderInput) => Promise<{ success: boolean; error?: string }>;
}

export const useOutsourcingStore = create<OutsourcingState>((set, get) => ({
  workers: [],
  jobsByWorker: {},
  selectedWorkerId: '',
  drawerJob: null,
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchWorkersAndJobs: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getJobWorkersAction();
    if (res.success && res.data) {
      const workers = res.data.workers as JobWorkerModel[];
      const jobsByWorker = res.data.jobsByWorker as Record<string, OutsourceJobModel[]>;
      const selectedId = get().selectedWorkerId || (workers[0]?.id ?? '');
      set({
        workers,
        jobsByWorker,
        selectedWorkerId: selectedId,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch outsourcing data' });
    }
  },

  setSelectedWorker: (id: string) => set({ selectedWorkerId: id }),
  setDrawerJob: (job: OutsourceJobModel | null) => set({ drawerJob: job }),

  recordJobReturn: async (input: ReceiveJobReturnInput) => {
    set({ isSubmitting: true });
    const prevWorkers = get().workers;
    const prevJobs = get().jobsByWorker;
    const prevDrawer = get().drawerJob;

    // 0ms Optimistic Update
    const currentWorkerId = get().selectedWorkerId;
    const currentJobs = prevJobs[currentWorkerId] || [];

    const updatedJobs = currentJobs.map((j) => {
      if (j.jid === input.jobId || j.id === input.jobId) {
        const newRet = j.ret + input.weightReturned;
        const isComplete = input.isCompleted || newRet >= j.sent;
        return {
          ...j,
          ret: newRet,
          status: isComplete ? 'returned' : 'partial',
        };
      }
      return j;
    });

    const updatedWorkers = prevWorkers.map((w) => {
      if (w.id === currentWorkerId) {
        return {
          ...w,
          held: Math.max(0, w.held - (input.weightReturned + (input.scrapReturned || 0))),
        };
      }
      return w;
    });

    set({
      workers: updatedWorkers,
      jobsByWorker: {
        ...prevJobs,
        [currentWorkerId]: updatedJobs,
      },
      drawerJob: prevDrawer ? { ...prevDrawer, ret: prevDrawer.ret + input.weightReturned } : null,
    });

    const res = await receiveJobReturnAction(input);
    if (!res.success) {
      // Rollback on failure
      set({
        workers: prevWorkers,
        jobsByWorker: prevJobs,
        drawerJob: prevDrawer,
        isSubmitting: false,
      });
      return { success: false, error: res.error || 'Failed to record return' };
    }

    set({ isSubmitting: false });
    return { success: true };
  },

  createJobOrder: async (input: CreateJobOrderInput) => {
    set({ isSubmitting: true });
    const res = await createJobOrderAction(input);
    if (res.success && res.data) {
      await get().fetchWorkersAndJobs();
      set({ isSubmitting: false });
      return { success: true };
    } else {
      set({ isSubmitting: false });
      return { success: false, error: res.error || 'Failed to create job order' };
    }
  },
}));
