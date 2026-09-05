import type { Activo, Paginado } from '@/types';
import { resourcesApi } from './api/resources';

export interface FiltrosActivos { busqueda?: string; categoria?: string | 'TODAS'; estado?: Activo['estado'] | 'TODOS'; page?: number; pageSize?: number; }
export type ActivoInput = Omit<Activo, 'id' | 'espacioNombre'> & { espacioId: string };

interface ActivoDB {
  id_activo: string;
  id_piso: string;
  id_categoria: number;
  codigo_inventario: string;
  nombre_activo: string;
  cantidad?: string | number | null;
  marca?: string | null;
  estado_activo: 'Excelente' | 'Bueno' | 'Regular' | 'Malo' | 'Crítico';
  valor_estimado?: string | number | null;
  fecha_adquisicion?: string | null;
  url_foto?: string | null;
  fecha_registro: string;
}

const categories: Record<number, string> = { 1: 'Mobiliario', 2: 'Equipos', 3: 'Infraestructura' };
const stateFromDb: Record<ActivoDB['estado_activo'], Activo['estado']> = { Excelente: 'BUENO', Bueno: 'BUENO', Regular: 'REGULAR', Malo: 'DETERIORADO', Crítico: 'CRITICO' };
const stateToDb: Record<Activo['estado'], ActivoDB['estado_activo']> = { BUENO: 'Bueno', REGULAR: 'Regular', DETERIORADO: 'Malo', CRITICO: 'Crítico' };
const categoryId = (category: string) => Object.entries(categories).find(([, name]) => name === category)?.[0] ?? '2';
const toNumber = (value: string | number | null | undefined, fallback = 0) => { const n = Number(value ?? NaN); return Number.isFinite(n) ? n : fallback; };

async function espaciosMap(): Promise<Record<string, string>> {
  try {
    const r = await resourcesApi.listar<{ id_piso: string; bloque_seccion: string }>('pisos_espacios', { pageSize: 1000 });
    const map: Record<string, string> = {};
    r.data.forEach((p) => { map[p.id_piso] = p.bloque_seccion; });
    return map;
  } catch {
    return {};
  }
}

const map = (a: ActivoDB, espacios: Record<string, string>): Activo => ({
  id: a.id_activo,
  codigo: a.codigo_inventario,
  nombre: a.nombre_activo,
  categoria: categories[a.id_categoria] ?? 'Sin categoría',
  espacioId: a.id_piso,
  espacioNombre: espacios[a.id_piso] ?? `Espacio ${a.id_piso}`,
  cantidad: toNumber(a.cantidad, 1),
  estado: stateFromDb[a.estado_activo],
  responsable: a.marca ?? 'Por asignar',
  valor: toNumber(a.valor_estimado),
  fechaAdquisicion: (a.fecha_adquisicion || a.fecha_registro || '').slice(0, 10),
});

const payload = (input: ActivoInput) => ({
  id_piso: Number(input.espacioId),
  id_categoria: Number(categoryId(input.categoria)),
  codigo_inventario: input.codigo,
  nombre_activo: input.nombre,
  cantidad: Number(input.cantidad) || 1,
  descripcion: input.responsable || null,
  marca: input.responsable || null,
  modelo: null,
  numero_serie: null,
  estado_activo: stateToDb[input.estado],
  nivel_riesgo: input.estado === 'DETERIORADO' || input.estado === 'CRITICO' ? 'Alto' : 'Bajo',
  estado_operativo: 'Activo',
  valor_estimado: Number(input.valor) || 0,
  fecha_adquisicion: input.fechaAdquisicion || null,
});

export const activosService = {
  async listar(f: FiltrosActivos = {}): Promise<Paginado<Activo>> {
    const params: Record<string, string | number | undefined> = {
      page: f.page,
      pageSize: f.pageSize,
      busqueda: f.busqueda,
    };
    if (f.categoria && f.categoria !== 'TODAS') params.id_categoria = Number(categoryId(f.categoria));
    if (f.estado && f.estado !== 'TODOS') params.estado_activo = stateToDb[f.estado];
    const r = await resourcesApi.listar<ActivoDB>('activos', params);
    const espacios = await espaciosMap();
    return { ...r, data: r.data.map((db) => map(db, espacios)) };
  },
  async resumen() { const r = await this.listar({ pageSize: 1000 }); return { total: r.total, valorTotal: r.data.reduce((sum, asset) => sum + asset.valor, 0) }; },
  async crear(input: ActivoInput): Promise<Activo> { return map(await resourcesApi.crear<ActivoDB, ReturnType<typeof payload>>('activos', payload(input)), await espaciosMap()); },
  async actualizar(id: string, input: ActivoInput): Promise<Activo> { return map(await resourcesApi.actualizar<ActivoDB, ReturnType<typeof payload>>('activos', id, payload(input)), await espaciosMap()); },
  async eliminar(id: string): Promise<void> { await resourcesApi.eliminar('activos', id); },
};