import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession } from '@/types';
import { authService } from '@/services/authService';

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
    (set) => ({
      session: null,
      cargando: false,
      error: null,
      iniciarSesion: async (correo, password, recordarme) => {
        set({ cargando: true, error: null });
        try {
          const session = await authService.login({ correo, password, recordarme });
          set({ session, cargando: false });
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
