import type { Espacio, Paginado } from '@/types';
import { delay, mockEspacios } from './mock/mockData';

const USE_MOCK = true;

export interface FiltrosEspacios {
  busqueda?: string;
  estado?: Espacio['estado'] | 'TODOS';
  page?: number;
  pageSize?: number;
}


export const espaciosService = {
  async listar(filtros: FiltrosEspacios = {}): Promise<Paginado<Espacio>> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...mockEspacios];
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        data = data.filter((e) => e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q));
      }
      if (filtros.estado && filtros.estado !== 'TODOS') {
        data = data.filter((e) => e.estado === filtros.estado);
      }
      const page = filtros.page ?? 1;
      const pageSize = filtros.pageSize ?? 12;
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
      return mockEspacios.find((e) => e.id === id);
    }
    throw new Error('Backend no configurado');
  },
};
