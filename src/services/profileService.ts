import { apiClient } from './api/client';
import type { PerfilUsuario } from '@/types';

export type PerfilInput = Pick<PerfilUsuario, 'documento_id' | 'nombres' | 'apellidos' | 'email'> & {
  telefono?: string | null; direccion?: string | null; avatar_url?: string | null;
};

export const profileService = {
  async obtener(): Promise<PerfilUsuario> {
    const { data } = await apiClient.get<{ usuario: PerfilUsuario }>('/api/profile/me');
    return data.usuario;
  },
  async actualizar(input: PerfilInput): Promise<PerfilUsuario> {
    const { data } = await apiClient.patch<{ usuario: PerfilUsuario }>('/api/profile/me', input);
    return data.usuario;
  },
  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    await apiClient.patch('/api/profile/me/password', { passwordActual, passwordNueva });
  },
};
