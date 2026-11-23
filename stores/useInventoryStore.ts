import { create } from 'zustand';
import { getInventoryItemsAction, createInventoryItemAction, auditStockAction } from '@/actions/inventory.actions';
import type { CreateInventoryItemInput } from '@/lib/validations/inventory.schema';

export interface InventoryItemModel {
  id: string;
  sku: string;
  cat: string;
  catCode?: string;
  purity: string;
  pieces: number;
  gross: number;
  fine: number;
  loc: string;
  status: 'in' | 'low' | 'reorder';
}

interface InventoryState {
  items: InventoryItemModel[];
  categories: Array<{ id: string; code: string; name: string }>;
  purities: Array<{ id: string; code: string; standard: string }>;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchInventory: () => Promise<void>;
  createInventoryItem: (input: CreateInventoryItemInput) => Promise<{ success: boolean; error?: string }>;
  auditStock: () => Promise<{ success: boolean; error?: string; data?: any }>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  categories: [],
  purities: [],
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchInventory: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getInventoryItemsAction();
    if (res.success && res.data) {
      set({
        items: res.data.items as InventoryItemModel[],
        categories: res.data.categories,
        purities: res.data.purities,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch inventory' });
    }
  },

  createInventoryItem: async (input: CreateInventoryItemInput) => {
    set({ isSubmitting: true });

    // 0ms Optimistic UI update
    const categoryName =
      get().categories.find((c) => c.id === input.categoryId)?.name || 'Jewellery';
    const purityName =
      get().purities.find((p) => p.id === input.purityId)?.standard.split(' ')[0] || '92.5';

    const optimisticItem: InventoryItemModel = {
      id: `temp_${Date.now()}`,
      sku: input.sku,
      cat: categoryName,
      purity: purityName,
      pieces: input.pieces,
      gross: input.grossWeight,
      fine: input.fineWeight,
      loc: input.location,
      status: input.status === 'IN_STOCK' ? 'in' : input.status === 'LOW' ? 'low' : 'reorder',
    };

    const prevItems = get().items;
    set({ items: [optimisticItem, ...prevItems] });

    const res = await createInventoryItemAction(input);
    if (res.success && res.data) {
      set((state) => ({
        items: state.items.map((i) => (i.sku === input.sku ? (res.data as InventoryItemModel) : i)),
        isSubmitting: false,
      }));
      return { success: true };
    } else {
      set({ items: prevItems, isSubmitting: false });
      return { success: false, error: res.error || 'Failed to create inventory item' };
    }
  },

  auditStock: async () => {
    const res = await auditStockAction();
    if (res.success) {
      await get().fetchInventory();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error };
  },
}));
