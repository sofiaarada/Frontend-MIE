import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourState {
  /** El usuario ya vio (o omitió) el tutorial: no se muestra solo de nuevo. */
  visto: boolean;
  /** El tour está activo en pantalla. */
  abierto: boolean;
  abrirTour: () => void;
  cerrarTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      visto: false,
      abierto: false,
      abrirTour: () => set({ abierto: true }),
      
      cerrarTour: () => set({ abierto: false, visto: true }),
    }),
    {
      name: 'mie-onboarding',
      
      partialize: (state) => ({ visto: state.visto }),
    }
  )
);
