import type { Espacio, Paginado } from '@/types';
import { resourcesApi } from './api/resources';

export interface FiltrosEspacios { busqueda?: string; page?: number; pageSize?: number; estado?: Espacio['estado'] | 'TODOS'; }
export type EspacioInput = Omit<Espacio, 'id' | 'problemasActivos' | 'ultimaInspeccion'>;
interface EspacioDB { id_piso: string; id_sede: string; numero_piso: number; bloque_seccion: string; descripcion_ubicacion?: string | null; }

const mapEspacio = (db: EspacioDB): Espacio => ({
  id: db.id_piso, codigo: `ESP-${db.id_piso}`, nombre: db.bloque_seccion, tipo: 'Espacio', sedeId: db.id_sede,
  piso: String(db.numero_piso), areaM2: 0, capacidad: 0, estado: 'BUENO', fotoUrl: undefined, ultimaInspeccion: undefined, problemasActivos: 0,
});
const payload = (input: EspacioInput) => ({ id_sede: Number(input.sedeId), numero_piso: Number.parseInt(input.piso, 10) || 1, bloque_seccion: input.nombre, descripcion_ubicacion: input.tipo || null });

export const espaciosService = {
  async listar(filtros: FiltrosEspacios = {}): Promise<Paginado<Espacio>> { const result = await resourcesApi.listar<EspacioDB>('pisos_espacios', { page: filtros.page, pageSize: filtros.pageSize, busqueda: filtros.busqueda }); return { ...result, data: result.data.map(mapEspacio) }; },
  async obtener(id: string): Promise<Espacio | undefined> { try { return mapEspacio(await resourcesApi.obtener<EspacioDB>('pisos_espacios', id)); } catch { return undefined; } },
  async crear(input: EspacioInput): Promise<Espacio> { return mapEspacio(await resourcesApi.crear<EspacioDB, ReturnType<typeof payload>>('pisos_espacios', payload(input))); },
  async actualizar(id: string, input: EspacioInput): Promise<Espacio> { return mapEspacio(await resourcesApi.actualizar<EspacioDB, ReturnType<typeof payload>>('pisos_espacios', id, payload(input))); },
  async eliminar(id: string): Promise<void> { await resourcesApi.eliminar('pisos_espacios', id); },
};
