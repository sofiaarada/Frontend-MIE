import type { Mantenimiento } from '@/types';
import { delay, mockMantenimientos } from './mock/mockData';

const USE_MOCK = true;

const db: Mantenimiento[] = [...mockMantenimientos];

export type MantenimientoInput = Omit<Mantenimiento, 'id'>;


export const mantenimientoService = {
  async listar(): Promise<Mantenimiento[]> {
    if (USE_MOCK) {
      await delay(400);
      return [...db].sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
    }
    
    throw new Error('Backend no configurado');
  },

  async crear(input: MantenimientoInput): Promise<Mantenimiento> {
    if (USE_MOCK) {
      await delay(500);
      const nuevo: Mantenimiento = { ...input, id: `m${Date.now()}` };
      db.unshift(nuevo);
      return nuevo;
    }
   
    throw new Error('Backend no configurado');
  },

  async actualizar(id: string, input: MantenimientoInput): Promise<Mantenimiento> {
    if (USE_MOCK) {
      await delay(500);
      const index = db.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Mantenimiento no encontrado.');
      db[index] = { ...db[index], ...input };
      return db[index];
    }
    throw new Error('Backend no configurado');
  },

  async eliminar(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = db.findIndex((m) => m.id === id);
      if (index !== -1) db.splice(index, 1);
      return;
    }
    throw new Error('Backend no configurado');
  },
};