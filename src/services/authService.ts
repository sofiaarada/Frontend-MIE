import type { AuthCredentials, AuthSession } from '@/types';
import { delay, usuarioActual } from './mock/mockData';


const USE_MOCK = true;

export const authService = {
  async login(credenciales: AuthCredentials): Promise<AuthSession> {
    if (USE_MOCK) {
      await delay(600);
      if (!credenciales.correo || !credenciales.password) {
        throw new Error('Correo y contraseña son obligatorios.');
      }
      return {
        usuario: usuarioActual,
        token: 'mock-jwt-token',
      };
    }
   
    throw new Error('Backend no configurado');
  },

  async recuperarPassword(correo: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      return;
    }
  
  },
};
