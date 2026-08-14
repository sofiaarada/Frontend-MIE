import type { Activo, Paginado } from '@/types';
import { delay, mockActivos, mockEspacios } from './mock/mockData';

const USE_MOCK = true;

const db: Activo[] = [...mockActivos];

export interface FiltrosActivos {
  busqueda?: string;
  categoria?: string | 'TODAS';
  estado?: Activo['estado'] | 'TODOS';
  page?: number;
  pageSize?: number;
}

export type ActivoInput = Omit<Activo, 'id' | 'espacioNombre'> & { espacioId: string };


export const activosService = {
  async listar(filtros: FiltrosActivos = {}): Promise<Paginado<Activo>> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...db];
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        data = data.filter((a) => a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q));
      }
      if (filtros.categoria && filtros.categoria !== 'TODAS') {
        data = data.filter((a) => a.categoria === filtros.categoria);
      }
      if (filtros.estado && filtros.estado !== 'TODOS') {
        data = data.filter((a) => a.estado === filtros.estado);
      }
      const page = filtros.page ?? 1;
      const pageSize = filtros.pageSize ?? 8;
      const start = (page - 1) * pageSize;
      return { data: data.slice(start, start + pageSize), total: data.length, page, pageSize };
    }
    
    throw new Error('Backend no configurado');
  },

  async resumen(): Promise<{ total: number; valorTotal: number }> {
    if (USE_MOCK) {
      await delay(200);
      return { total: db.length, valorTotal: db.reduce((acc, a) => acc + a.valor * a.cantidad, 0) };
    }
    throw new Error('Backend no configurado');
  },

  async crear(input: ActivoInput): Promise<Activo> {
    if (USE_MOCK) {
      await delay(500);
      const espacio = mockEspacios.find((e) => e.id === input.espacioId);
      const nuevo: Activo = { ...input, id: `ac${Date.now()}`, espacioNombre: espacio?.nombre ?? '—' };
      db.unshift(nuevo);
      return nuevo;
    }
    
    throw new Error('Backend no configurado');
  },

  async actualizar(id: string, input: ActivoInput): Promise<Activo> {
    if (USE_MOCK) {
      await delay(500);
      const index = db.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Activo no encontrado.');
      const espacio = mockEspacios.find((e) => e.id === input.espacioId);
      db[index] = { ...db[index], ...input, espacioNombre: espacio?.nombre ?? db[index].espacioNombre };
      return db[index];
    }
    throw new Error('Backend no configurado');
  },

  async eliminar(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = db.findIndex((a) => a.id === id);
      if (index !== -1) db.splice(index, 1);
      return;
    }
    throw new Error('Backend no configurado');
  },
};