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
      // Se marque o se omita, queda como visto para futuras sesiones.
      cerrarTour: () => set({ abierto: false, visto: true }),
    }),
    {
      name: 'mie-onboarding',
      // Solo persistimos `visto`: que aparezca es una decisión de la sesión actual.
      partialize: (state) => ({ visto: state.visto }),
    }
  )
);
