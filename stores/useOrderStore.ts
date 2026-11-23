import { create } from 'zustand';
import { getOrdersAction, getOrderByIdAction, createOrderAction, updateOrderStatusAction } from '@/actions/order.actions';
import type { CreateOrderInput } from '@/lib/validations/order.schema';

export interface OrderModel {
  id: string;
  no: string;
  clientId: string;
  client: string;
  city?: string;
  products: string;
  gross: number;
  fine: number;
  status: string;
  due: string;
  prog: number;
  rateLocked: number;
  outS: number;
  outI: number;
  itemCount?: number;
}

export interface OrderDetailModel extends OrderModel {
  clientCity: string;
  clientGst: string;
  clientSilverOut: number;
  clientInrOut: number;
  items: Array<{
    id: string;
    name: string;
    gross: number;
    fine: number;
    making: number;
    silverVal: number;
    total: number;
  }>;
  batches: Array<{
    bid: string;
    product: string;
    weight: number;
    stage: string;
    inStage: string;
    delay: boolean;
  }>;
}

interface OrderState {
  orders: OrderModel[];
  selectedOrder: OrderDetailModel | null;
  orderFilter: string;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  // Actions
  fetchOrders: (filter?: string) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  setOrderFilter: (filter: string) => void;
  createOrder: (input: CreateOrderInput, clientNameFallback?: string) => Promise<{ success: boolean; error?: string; orderNo?: string }>;
  updateOrderStatus: (orderId: string, status: string) => Promise<{ success: boolean; error?: string }>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  orderFilter: 'all',
  isLoading: false,
  isSubmitting: false,
  errorMessage: null,

  fetchOrders: async (filter?: string) => {
    const activeFilter = filter !== undefined ? filter : get().orderFilter;
    set({ isLoading: true, errorMessage: null });
    const res = await getOrdersAction(activeFilter);
    if (res.success && res.data) {
      set({ orders: res.data as OrderModel[], isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Failed to fetch orders' });
    }
  },

  fetchOrderById: async (orderNoOrId: string) => {
    set({ isLoading: true });
    const res = await getOrderByIdAction(orderNoOrId);
    if (res.success && res.data) {
      set({ selectedOrder: res.data as OrderDetailModel, isLoading: false });
    } else {
      set({ isLoading: false, errorMessage: res.error || 'Order not found' });
    }
  },

  setOrderFilter: (filter: string) => {
    set({ orderFilter: filter });
    get().fetchOrders(filter);
  },

  createOrder: async (input: CreateOrderInput, clientNameFallback?: string) => {
    set({ isSubmitting: true });

    // 0ms Optimistic UI calculation
    let optGross = 0;
    let optFine = 0;
    input.items.forEach((i) => {
      optGross += i.grossWeight;
      optFine += i.fineWeight;
    });

    const tempNo = `ORD-${Date.now().toString().slice(-4)}`;
    const optimisticOrder: OrderModel = {
      id: `temp_${Date.now()}`,
      no: tempNo,
      clientId: input.clientId,
      client: clientNameFallback || 'New Order Client',
      products: input.items.map((i) => i.name).join(', '),
      gross: optGross,
      fine: optFine,
      status: 'production',
      due: input.dueDate,
      prog: 15,
      rateLocked: input.rateLocked,
      outS: optGross,
      outI: optFine * (input.rateLocked / 1000),
      itemCount: input.items.length,
    };

    const prevOrders = get().orders;
    set({ orders: [optimisticOrder, ...prevOrders] });

    // Background Database Transaction
    const res = await createOrderAction(input);

    if (res.success && res.data) {
      set((state) => ({
        orders: state.orders.map((o) => (o.no === tempNo ? (res.data as OrderModel) : o)),
        isSubmitting: false,
      }));
      return { success: true, orderNo: res.data!.no };
    } else {
      // Rollback on failure
      set({ orders: prevOrders, isSubmitting: false });
      return { success: false, error: res.error || 'Order creation failed' };
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    // 0ms Optimistic status reflection
    const progressMap: Record<string, number> = {
      production: 50,
      qc: 85,
      dispatched: 100,
      completed: 100,
      hold: 25,
      overdue: 70,
    };

    const prevOrders = get().orders;
    const prevSelected = get().selectedOrder;

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId || o.no === orderId
          ? { ...o, status: status.toLowerCase(), prog: progressMap[status.toLowerCase()] || o.prog }
          : o
      ),
      selectedOrder:
        state.selectedOrder && (state.selectedOrder.id === orderId || state.selectedOrder.no === orderId)
          ? { ...state.selectedOrder, status: status.toLowerCase(), prog: progressMap[status.toLowerCase()] || state.selectedOrder.prog }
          : state.selectedOrder,
    }));

    const res = await updateOrderStatusAction(orderId, status);
    if (!res.success) {
      // Rollback
      set({ orders: prevOrders, selectedOrder: prevSelected });
      return { success: false, error: res.error || 'Status update failed' };
    }
    return { success: true };
  },
}));
