import { create } from 'zustand';
import { getClientsAction, createClientAction } from '@/actions/client.actions';
import type { ClientInput } from '@/lib/validations/client.schema';

export interface ClientModel {
  id: string;
  clientCode: string;
  name: string;
  city: string;
  gst: string;
  init: string;
  last: string;
  silverOut: number;
  inrOut: number;
  credS: number;
  credI: number;
  orders: Array<{
    no: string;
    products: string;
    gross: number;
    fine: number;
    status: string;
    due: string;
    outS: number;
    outI: number;
  }>;
}

interface ClientState {
  clients: ClientModel[];
  selectedClientId: string | null;
  clientTab: string;
  searchQuery: string;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  // Actions
  fetchClients: () => Promise<void>;
  setSelectedClientId: (id: string) => void;
  setClientTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  createClient: (input: ClientInput) => Promise<{ success: boolean; error?: string }>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  selectedClientId: null,
  clientTab: 'timeline',
  searchQuery: '',
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchClients: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getClientsAction();
    if (res.success && res.data) {
      set({
        clients: res.data as ClientModel[],
        selectedClientId: get().selectedClientId || res.data[0]?.id || null,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch clients' });
    }
  },

  setSelectedClientId: (id: string) => set({ selectedClientId: id, clientTab: 'timeline' }),
  setClientTab: (tab: string) => set({ clientTab: tab }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  createClient: async (input: ClientInput) => {
    set({ isSubmitting: true });

    // 0ms Optimistic Update: Create temporary client in UI instantly
    const tempId = `temp_${Date.now()}`;
    const initials = input.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CL';
    const optimisticClient: ClientModel = {
      id: tempId,
      clientCode: tempId,
      name: input.name,
      city: input.city,
      gst: input.gstNumber,
      init: initials,
      last: 'Just now',
      silverOut: 0,
      inrOut: 0,
      credS: input.creditSilverLimit,
      credI: input.creditInrLimit,
      orders: [],
    };

    const previousClients = get().clients;
    // Prepend optimistic client immediately
    set({
      clients: [optimisticClient, ...previousClients],
      selectedClientId: tempId,
    });

    // Execute background PostgreSQL database write
    const res = await createClientAction(input);

    if (res.success && res.data) {
      // Reconcile optimistic record with real database row
      set((state) => ({
        clients: state.clients.map((c) => (c.id === tempId ? (res.data as ClientModel) : c)),
        selectedClientId: res.data!.id,
        isSubmitting: false,
      }));
      return { success: true };
    } else {
      // Rollback on failure
      set({
        clients: previousClients,
        selectedClientId: previousClients[0]?.id || null,
        isSubmitting: false,
      });
      return { success: false, error: res.error || 'Database write failed' };
    }
  },
}));
