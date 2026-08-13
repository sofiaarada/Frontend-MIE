import { create } from 'zustand';

interface UiState {
  sidebarColapsado: boolean;
  alternarSidebar: () => void;
  sidebarMobileAbierto: boolean;
  setSidebarMobileAbierto: (abierto: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarColapsado: false,
  alternarSidebar: () => set((s) => ({ sidebarColapsado: !s.sidebarColapsado })),
  sidebarMobileAbierto: false,
  setSidebarMobileAbierto: (abierto) => set({ sidebarMobileAbierto: abierto }),
}));
