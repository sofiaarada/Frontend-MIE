import { apiClient } from './api/client';
import type { AuthCredentials, AuthSession, Usuario, Role } from '@/types';
import { authApi } from './api/resources';

function mapBackendUserToFrontend(user: any): Usuario {
  return {
    id: user.id_usuario,
    nombre: `${user.nombres} ${user.apellidos}`,
    correo: user.email,
    rol: user.nombre_rol as Role,
    sede: user.id_institucion,
    activo: user.estado === 'Activo',
    avatarUrl: user.avatar_url ?? undefined,
    creadoEn: new Date().toISOString().split('T')[0],
  };
}

export const authService = {
  async login(credenciales: AuthCredentials): Promise<AuthSession> {
    const data = await authApi.login(credenciales.correo, credenciales.password);
    return {
      usuario: mapBackendUserToFrontend(data.usuario),
      token: data.token,
    };
  },

  async me(): Promise<Usuario> {
    const usuario = await authApi.me();
    return mapBackendUserToFrontend(usuario);
  },

  async recuperarPassword(correo: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email: correo });
  },
};
