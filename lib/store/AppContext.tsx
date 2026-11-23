'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Batch } from '../types';
import { batches as initialBatches } from '../data';
import { productionStages } from '../data';

interface AppState {
  rate: number;
  rateBase: number;
  clock: string;
  toast: string | null;
  sidebarExpanded: boolean;
  mobileSidebarOpen: boolean;
  newMenuOpen: boolean;
  batches: Batch[];
  selectedOrder: string;
  selectedClient: string;
  selectedWorker: string;
  selectedKarigar: string;
  clientTab: string;
  orderFilter: string;
  productionView: 'kanban' | 'table';
  settingsTab: string;
  masterTab: string;
  invoiceOpen: boolean;
  drawerJob: unknown;
  notif: { push: boolean; silver: boolean; overdue: boolean; daily: boolean };
  twoFA: boolean;
  autoBills: boolean;
}

interface AppActions {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleNewMenu: () => void;
  closeNewMenu: () => void;
  showToast: (msg: string) => void;
  advanceBatch: (bid: string) => void;
  setSelectedOrder: (no: string) => void;
  setSelectedClient: (id: string) => void;
  setSelectedWorker: (id: string) => void;
  setSelectedKarigar: (id: string) => void;
  setClientTab: (t: string) => void;
  setOrderFilter: (f: string) => void;
  setProductionView: (v: 'kanban' | 'table') => void;
  setSettingsTab: (t: string) => void;
  setMasterTab: (t: string) => void;
  setInvoiceOpen: (v: boolean) => void;
  setDrawerJob: (j: unknown) => void;
  toggleNotif: (k: keyof AppState['notif']) => void;
  toggleFlag: (k: 'twoFA' | 'autoBills') => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

function getClock() {
  const t = new Date();
  let h = t.getHours(), m = t.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    rate: 89420,
    rateBase: 89000,
    clock: getClock(),
    toast: null,
    sidebarExpanded: true,
    mobileSidebarOpen: false,
    newMenuOpen: false,
    batches: initialBatches,
    selectedOrder: 'ORD-2241',
    selectedClient: 'mehta',
    selectedWorker: 'w1',
    selectedKarigar: 'k1',
    clientTab: 'timeline',
    orderFilter: 'all',
    productionView: 'kanban',
    settingsTab: 'company',
    masterTab: 'categories',
    invoiceOpen: false,
    drawerJob: null,
    notif: { push: true, silver: true, overdue: true, daily: false },
    twoFA: false,
    autoBills: true,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rateTimer = setInterval(() => {
      setState(s => {
        const d = (Math.random() - 0.46) * 70;
        const r = Math.max(88200, Math.min(90800, s.rate + d));
        return { ...s, rate: Math.round(r) };
      });
    }, 3200);
    const clockTimer = setInterval(() => {
      const c = getClock();
      setState(s => s.clock !== c ? { ...s, clock: c } : s);
    }, 15000);
    return () => { clearInterval(rateTimer); clearInterval(clockTimer); };
  }, []);

  const showToast = useCallback((msg: string) => {
    setState(s => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState(s => ({ ...s, toast: null })), 2600);
  }, []);

  const advanceBatch = useCallback((bid: string) => {
    setState(s => {
      const order = productionStages.map(x => x.id);
      const newBatches = s.batches.map(b => {
        if (b.bid !== bid) return b;
        const i = order.indexOf(b.stage);
        if (i >= order.length - 1) return b;
        return { ...b, stage: order[i + 1], inStage: 'just now', delay: false };
      });
      return { ...s, batches: newBatches };
    });
    showToast(bid + ' advanced to next stage');
  }, [showToast]);

  const actions: AppActions = {
    toggleSidebar: () => setState(s => ({ ...s, sidebarExpanded: !s.sidebarExpanded })),
    toggleMobileSidebar: () => setState(s => ({ ...s, mobileSidebarOpen: !s.mobileSidebarOpen })),
    closeMobileSidebar: () => setState(s => ({ ...s, mobileSidebarOpen: false })),
    toggleNewMenu: () => setState(s => ({ ...s, newMenuOpen: !s.newMenuOpen })),
    closeNewMenu: () => setState(s => ({ ...s, newMenuOpen: false })),
    showToast,
    advanceBatch,
    setSelectedOrder: (no) => setState(s => ({ ...s, selectedOrder: no })),
    setSelectedClient: (id) => setState(s => ({ ...s, selectedClient: id, clientTab: 'timeline' })),
    setSelectedWorker: (id) => setState(s => ({ ...s, selectedWorker: id, drawerJob: null })),
    setSelectedKarigar: (id) => setState(s => ({ ...s, selectedKarigar: id })),
    setClientTab: (t) => setState(s => ({ ...s, clientTab: t })),
    setOrderFilter: (f) => setState(s => ({ ...s, orderFilter: f })),
    setProductionView: (v) => setState(s => ({ ...s, productionView: v })),
    setSettingsTab: (t) => setState(s => ({ ...s, settingsTab: t })),
    setMasterTab: (t) => setState(s => ({ ...s, masterTab: t })),
    setInvoiceOpen: (v) => setState(s => ({ ...s, invoiceOpen: v })),
    setDrawerJob: (j) => setState(s => ({ ...s, drawerJob: j })),
    toggleNotif: (k) => setState(s => ({ ...s, notif: { ...s.notif, [k]: !s.notif[k] } })),
    toggleFlag: (k) => setState(s => ({ ...s, [k]: !s[k] })),
  };

  return <AppContext.Provider value={{ ...state, ...actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
