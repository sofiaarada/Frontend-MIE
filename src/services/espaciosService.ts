import type { Espacio, EstadoInfraestructura, Paginado } from '@/types';
import { resourcesApi } from './api/resources';

export interface FiltrosEspacios { busqueda?: string; page?: number; pageSize?: number; estado?: Espacio['estado'] | 'TODOS'; }
export type EspacioInput = Omit<Espacio, 'id' | 'problemasActivos'>;

interface EspacioDB {
  id_piso: string;
  id_sede: string;
  numero_piso: number;
  bloque_seccion: string;
  codigo_espacio?: string | null;
  tipo_espacio?: string | null;
  area_m2?: string | number | null;
  capacidad?: string | number | null;
  estado_espacio?: 'Excelente' | 'Bueno' | 'Regular' | 'Malo' | 'Crítico' | null;
  url_foto?: string | null;
  fecha_ultima_inspeccion?: string | null;
  descripcion_ubicacion?: string | null;
}

const DB_A_ESTADO: Record<string, EstadoInfraestructura> = {
  Excelente: 'BUENO',
  Bueno: 'BUENO',
  Regular: 'REGULAR',
  Malo: 'DETERIORADO',
  Crítico: 'CRITICO',
};

const ESTADO_A_DB: Record<Espacio['estado'], string> = {
  BUENO: 'Bueno',
  REGULAR: 'Regular',
  DETERIORADO: 'Malo',
  CRITICO: 'Crítico',
};

const mapEspacio = (db: EspacioDB): Espacio => ({
  id: db.id_piso,
  codigo: db.codigo_espacio || `ESP-${db.id_piso}`,
  nombre: db.bloque_seccion,
  tipo: db.tipo_espacio || 'Espacio',
  sedeId: db.id_sede,
  piso: String(db.numero_piso ?? ''),
  areaM2: Number(db.area_m2 ?? 0),
  capacidad: Number(db.capacidad ?? 0),
  estado: (db.estado_espacio && DB_A_ESTADO[db.estado_espacio]) || 'BUENO',
  fotoUrl: db.url_foto ?? undefined,
  ultimaInspeccion: db.fecha_ultima_inspeccion || undefined,
  problemasActivos: 0,
});

const payload = (input: EspacioInput) => ({
  id_sede: Number(input.sedeId),
  numero_piso: Number.parseInt(input.piso, 10) || 1,
  bloque_seccion: input.nombre,
  codigo_espacio: input.codigo,
  tipo_espacio: input.tipo,
  area_m2: Number(input.areaM2) || 0,
  capacidad: Number(input.capacidad) || 0,
  estado_espacio: ESTADO_A_DB[input.estado],
  url_foto: input.fotoUrl || null,
  fecha_ultima_inspeccion: input.ultimaInspeccion || null,
  descripcion_ubicacion: input.piso || null,
});

export const espaciosService = {
  async listar(filtros: FiltrosEspacios = {}): Promise<Paginado<Espacio>> {
    const params: Record<string, string | number | undefined> = {
      page: filtros.page,
      pageSize: filtros.pageSize,
      busqueda: filtros.busqueda,
    };
    if (filtros.estado && filtros.estado !== 'TODOS') params.estado_espacio = ESTADO_A_DB[filtros.estado];
    const result = await resourcesApi.listar<EspacioDB>('pisos_espacios', params);
    return { ...result, data: result.data.map(mapEspacio) };
  },
  async obtener(id: string): Promise<Espacio | undefined> { try { return mapEspacio(await resourcesApi.obtener<EspacioDB>('pisos_espacios', id)); } catch { return undefined; } },
  async crear(input: EspacioInput): Promise<Espacio> { return mapEspacio(await resourcesApi.crear<EspacioDB, ReturnType<typeof payload>>('pisos_espacios', payload(input))); },
  async actualizar(id: string, input: EspacioInput): Promise<Espacio> { return mapEspacio(await resourcesApi.actualizar<EspacioDB, ReturnType<typeof payload>>('pisos_espacios', id, payload(input))); },
  async eliminar(id: string): Promise<void> { await resourcesApi.eliminar('pisos_espacios', id); },
};