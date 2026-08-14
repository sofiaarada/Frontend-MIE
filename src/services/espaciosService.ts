import type { Espacio, Paginado } from '@/types';
import { delay, mockEspacios } from './mock/mockData';

const USE_MOCK = true;


const db: Espacio[] = [...mockEspacios];

export interface FiltrosEspacios {
  busqueda?: string;
  estado?: Espacio['estado'] | 'TODOS';
  page?: number;
  pageSize?: number;
}

export type EspacioInput = Omit<Espacio, 'id' | 'problemasActivos' | 'ultimaInspeccion'>;

export const espaciosService = {
  async listar(filtros: FiltrosEspacios = {}): Promise<Paginado<Espacio>> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...db];
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        data = data.filter((e) => e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q));
      }
      if (filtros.estado && filtros.estado !== 'TODOS') {
        data = data.filter((e) => e.estado === filtros.estado);
      }
      const page = filtros.page ?? 1;
      const pageSize = filtros.pageSize ?? 8;
      const start = (page - 1) * pageSize;
      return {
        data: data.slice(start, start + pageSize),
        total: data.length,
        page,
        pageSize,
      };
    }

    throw new Error('Backend no configurado');
  },

  async obtener(id: string): Promise<Espacio | undefined> {
    if (USE_MOCK) {
      await delay(300);
      return db.find((e) => e.id === id);
    }
    throw new Error('Backend no configurado');
  },

  async crear(input: EspacioInput): Promise<Espacio> {
    if (USE_MOCK) {
      await delay(500);
      const nuevo: Espacio = { ...input, id: `e${Date.now()}`, problemasActivos: 0 };
      db.unshift(nuevo);
      return nuevo;
    }
  
    throw new Error('Backend no configurado');
  },

  async actualizar(id: string, input: EspacioInput): Promise<Espacio> {
    if (USE_MOCK) {
      await delay(500);
      const index = db.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Espacio no encontrado.');
      db[index] = { ...db[index], ...input };
      return db[index];
    }
    throw new Error('Backend no configurado');
  },

  async eliminar(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = db.findIndex((e) => e.id === id);
      if (index !== -1) db.splice(index, 1);
      return;
    }
    throw new Error('Backend no configurado');
  },
};