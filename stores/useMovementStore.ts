import { create } from 'zustand';
import { getMovementsAction, createMovementAction } from '@/actions/movement.actions';
import type { CreateMovementInput } from '@/lib/validations/movement.schema';

export interface MovementModel {
  id: string;
  date: string;
  type: string;
  from: string;
  to: string;
  ref: string;
  wt: number;
  by: string;
}

interface MovementState {
  movements: MovementModel[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  fetchMovements: () => Promise<void>;
  recordMovement: (input: CreateMovementInput) => Promise<{ success: boolean; error?: string }>;
}

export const useMovementStore = create<MovementState>((set, get) => ({
  movements: [],
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchMovements: async () => {
    set({ isLoading: true, errorMessage: null });
    const res = await getMovementsAction();
    if (res.success && res.data) {
      set({ movements: res.data as MovementModel[], isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch movements' });
    }
  },

  recordMovement: async (input: CreateMovementInput) => {
    set({ isSubmitting: true });

    // 0ms Optimistic UI update
    const now = new Date();
    const dateDisplay = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    const formattedType =
      input.movementType.charAt(0) + input.movementType.slice(1).toLowerCase();

    const optimisticMovement: MovementModel = {
      id: `temp_${Date.now()}`,
      date: dateDisplay,
      type: formattedType,
      from: input.fromLocation,
      to: input.toLocation,
      ref: input.referenceNo,
      wt: input.fineWeight,
      by: input.createdByName,
    };

    const prevMovements = get().movements;
    set({ movements: [optimisticMovement, ...prevMovements] });

    const res = await createMovementAction(input);
    if (res.success && res.data) {
      set((state) => ({
        movements: state.movements.map((m) =>
          m.id === optimisticMovement.id ? (res.data as MovementModel) : m
        ),
        isSubmitting: false,
      }));
      return { success: true };
    } else {
      set({ movements: prevMovements, isSubmitting: false });
      return { success: false, error: res.error || 'Failed to record movement' };
    }
  },
}));
