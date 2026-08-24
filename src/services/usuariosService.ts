import type { Usuario, Role, Paginado } from '@/types';
import { delay, mockUsuarios } from './mock/mockData';

const USE_MOCK = true;

const db: Usuario[] = [...mockUsuarios];

export interface FiltrosUsuarios {
  busqueda?: string;
  rol?: Role | 'TODOS';
  page?: number;
  pageSize?: number;
}

export type UsuarioInput = Omit<Usuario, 'id' | 'creadoEn'>;

// Mismo patrón de siempre: listar/crear/actualizar/eliminar sobre una base
// en memoria mientras no exista el backend.
export const usuariosService = {
  async listar(filtros: FiltrosUsuarios = {}): Promise<Paginado<Usuario>> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...db];
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        data = data.filter((u) => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q));
      }
      if (filtros.rol && filtros.rol !== 'TODOS') {
        data = data.filter((u) => u.rol === filtros.rol);
      }
      const page = filtros.page ?? 1;
      const pageSize = filtros.pageSize ?? 8;
      const start = (page - 1) * pageSize;
      return { data: data.slice(start, start + pageSize), total: data.length, page, pageSize };
    }
    // const { data } = await apiClient.get<Paginado<Usuario>>('/usuarios', { params: filtros });
    // return data;
    throw new Error('Backend no configurado');
  },

  async crear(input: UsuarioInput): Promise<Usuario> {
    if (USE_MOCK) {
      await delay(500);
      const nuevo: Usuario = { ...input, id: `u${Date.now()}`, creadoEn: new Date().toISOString().slice(0, 10) };
      db.unshift(nuevo);
      return nuevo;
    }
    // const { data } = await apiClient.post<Usuario>('/usuarios', input);
    // return data;
    throw new Error('Backend no configurado');
  },

  async actualizar(id: string, input: UsuarioInput): Promise<Usuario> {
    if (USE_MOCK) {
      await delay(500);
      const index = db.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado.');
      db[index] = { ...db[index], ...input };
      return db[index];
    }
    throw new Error('Backend no configurado');
  },

  async eliminar(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = db.findIndex((u) => u.id === id);
      if (index !== -1) db.splice(index, 1);
      return;
    }
    throw new Error('Backend no configurado');
  },
};