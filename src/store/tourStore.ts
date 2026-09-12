import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourState {
  /** El usuario ya vio (o omitió) el tutorial: no se muestra solo de nuevo. */
  visto: boolean;
  /** El tour está activo en pantalla. */
  abierto: boolean;
  /** Si se debe mostrar el tutorial tras login (se resetea en logout). */
  pendienteTrasLogin: boolean;
  abrirTour: () => void;
  cerrarTour: () => void;
  marcarComoVisto: () => void;
  resetParaNuevoLogin: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      visto: false,
      abierto: false,
      pendienteTrasLogin: false,
      abrirTour: () => set({ abierto: true }),
      
      cerrarTour: () => set({ abierto: false, visto: true }),
      
      marcarComoVisto: () => set({ visto: true }),
      resetParaNuevoLogin: () => set({ visto: false, abierto: false, pendienteTrasLogin: true }),
    }),
    {
      name: 'mie-onboarding',
      
      partialize: (state) => ({ visto: state.visto }),
    }
  )
);
