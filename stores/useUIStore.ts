import { create } from 'zustand';

interface UIState {
  sidebarExpanded: boolean;
  mobileSidebarOpen: boolean;
  newMenuOpen: boolean;
  toast: string | null;
  rate: number;
  rateBase: number;
  clock: string;

  // Actions
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleNewMenu: () => void;
  closeNewMenu: () => void;
  showToast: (msg: string) => void;
  setRate: (rate: number) => void;
  setClock: (clock: string) => void;
}

function getClock() {
  const t = new Date();
  let h = t.getHours(),
    m = t.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: true,
  mobileSidebarOpen: false,
  newMenuOpen: false,
  toast: null,
  rate: 89420,
  rateBase: 89000,
  clock: getClock(),

  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleNewMenu: () => set((s) => ({ newMenuOpen: !s.newMenuOpen })),
  closeNewMenu: () => set({ newMenuOpen: false }),

  showToast: (msg: string) => {
    set({ toast: msg });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },

  setRate: (rate: number) => set({ rate }),
  setClock: (clock: string) => set({ clock }),
}));
