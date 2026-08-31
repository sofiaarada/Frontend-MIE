import type { Activo, Paginado } from '@/types';
import { resourcesApi } from './api/resources';

export interface FiltrosActivos { busqueda?: string; categoria?: string | 'TODAS'; estado?: Activo['estado'] | 'TODOS'; page?: number; pageSize?: number; }
export type ActivoInput = Omit<Activo, 'id' | 'espacioNombre'> & { espacioId: string };
interface ActivoDB { id_activo: string; id_piso: string; id_categoria: number; codigo_inventario: string; nombre_activo: string; marca?: string | null; estado_activo: 'Excelente' | 'Bueno' | 'Regular' | 'Malo' | 'Crítico'; fecha_registro: string; }
const categories: Record<number, string> = { 1: 'Mobiliario', 2: 'Equipos', 3: 'Infraestructura' };
const stateFromDb: Record<ActivoDB['estado_activo'], Activo['estado']> = { Excelente: 'BUENO', Bueno: 'BUENO', Regular: 'REGULAR', Malo: 'DETERIORADO', Crítico: 'CRITICO' };
const stateToDb: Record<Activo['estado'], ActivoDB['estado_activo']> = { BUENO: 'Bueno', REGULAR: 'Regular', DETERIORADO: 'Malo', CRITICO: 'Crítico' };
const categoryId = (category: string) => Object.entries(categories).find(([, name]) => name === category)?.[0] ?? '2';
const map = (a: ActivoDB): Activo => ({ id: a.id_activo, codigo: a.codigo_inventario, nombre: a.nombre_activo, categoria: categories[a.id_categoria] ?? 'Sin categoría', espacioId: a.id_piso, espacioNombre: `Espacio ${a.id_piso}`, cantidad: 1, estado: stateFromDb[a.estado_activo], responsable: a.marca ?? 'Sin asignar', valor: 0, fechaAdquisicion: a.fecha_registro.split('T')[0] });
const payload = (input: ActivoInput) => ({ id_piso: Number(input.espacioId), id_categoria: Number(categoryId(input.categoria)), codigo_inventario: input.codigo, nombre_activo: input.nombre, descripcion: input.responsable || null, marca: input.responsable || null, modelo: null, numero_serie: null, estado_activo: stateToDb[input.estado], nivel_riesgo: 'Bajo', estado_operativo: 'Activo' });

export const activosService = {
  async listar(f: FiltrosActivos = {}): Promise<Paginado<Activo>> { const r = await resourcesApi.listar<ActivoDB>('activos', { page: f.page, pageSize: f.pageSize, busqueda: f.busqueda }); const filtered = r.data.map(map).filter((a) => (!f.categoria || f.categoria === 'TODAS' || a.categoria === f.categoria) && (!f.estado || f.estado === 'TODOS' || a.estado === f.estado)); return { ...r, data: filtered, total: f.categoria !== 'TODAS' || f.estado !== 'TODOS' ? filtered.length : r.total }; },
  async resumen() { const r = await this.listar({ pageSize: 1000 }); return { total: r.total, valorTotal: r.data.reduce((sum, asset) => sum + asset.valor, 0) }; },
  async crear(input: ActivoInput): Promise<Activo> { return map(await resourcesApi.crear<ActivoDB, ReturnType<typeof payload>>('activos', payload(input))); },
  async actualizar(id: string, input: ActivoInput): Promise<Activo> { return map(await resourcesApi.actualizar<ActivoDB, ReturnType<typeof payload>>('activos', id, payload(input))); },
  async eliminar(id: string): Promise<void> { await resourcesApi.eliminar('activos', id); },
};
