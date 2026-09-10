import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession } from '@/types';
import { authService } from '@/services/authService';
import { useTourStore } from './tourStore';

interface AuthState {
  session: AuthSession | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (correo: string, password: string, recordarme?: boolean) => Promise<void>;
  cerrarSesion: () => void;
  actualizarUsuario: (usuario: AuthSession['usuario']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      cargando: false,
      error: null,
      iniciarSesion: async (correo, password, recordarme) => {
        set({ cargando: true, error: null });
        try {
          const session = await authService.login({ correo, password, recordarme });
          set({ session, cargando: false });
          // Solo disparar reset para nuevo tutorial en login real,
          // no en cada navegación para evitar redirecciones inesperadas
          // useTourStore.getState().resetParaNuevoLogin();
        } catch (err) {
          const mensaje = err instanceof Error ? err.message : 'No se pudo iniciar sesión.';
          set({ error: mensaje, cargando: false });
          throw err;
        }
      },
      cerrarSesion: () => set({ session: null }),
      actualizarUsuario: (usuario) => set((state) => state.session ? { session: { ...state.session, usuario } } : state),
    }),
    {
      name: 'mie-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);
