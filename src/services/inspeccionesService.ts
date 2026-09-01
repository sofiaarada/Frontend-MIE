import type { Inspeccion, ChecklistItem, EstadoInfraestructura } from '@/types';
import { resourcesApi } from './api/resources';
import { activosService } from './activosService';
import { useAuthStore } from '@/store/authStore';

export type InspeccionInput = {
  espacioId: string;
  espacioNombre: string;
  inspector: string;
  fecha: string;
  checklist: ChecklistItem[];
  notas?: string;
  evidencias: string[];
};

interface InspeccionDB {
  id_inspeccion: string;
  id_inspector: string;
  id_activo: string;
  fecha_inspeccion: string;
  ubicacion_exacta: string;
  estado_evaluado: string;
  nivel_riesgo_calificado: string;
  observaciones: string | null;
}

const ESTADO_A_DB: Record<EstadoInfraestructura, string> = {
  BUENO: 'Bueno',
  REGULAR: 'Regular',
  DETERIORADO: 'Malo',
  CRITICO: 'Crítico',
};
const DB_A_ESTADO: Record<string, EstadoInfraestructura> = {
  Excelente: 'BUENO',
  Bueno: 'BUENO',
  Regular: 'REGULAR',
  Malo: 'DETERIORADO',
  Crítico: 'CRITICO',
};
const PUNTAJE_ESTADO: Record<EstadoInfraestructura, number> = {
  BUENO: 85, REGULAR: 65, DETERIORADO: 45, CRITICO: 30,
};

export function calcularEstado(checklist: ChecklistItem[]): EstadoInfraestructura {
  const total = checklist.length;
  const buenos = checklist.filter((c) => c.cumple).length;
  const p = total ? (buenos / total) * 100 : 0;
  if (p >= 80) return 'BUENO';
  if (p >= 60) return 'REGULAR';
  if (p >= 40) return 'DETERIORADO';
  return 'CRITICO';
}

function riesgoPara(estado: EstadoInfraestructura): string {
  return estado === 'DETERIORADO' || estado === 'CRITICO' ? 'Alto' : 'Bajo';
}

async function activoNombreMap(): Promise<Record<string, string>> {
  try {
    const r = await activosService.listar({ pageSize: 1000 });
    const map: Record<string, string> = {};
    r.data.forEach((a) => { map[a.id] = a.nombre; });
    return map;
  } catch {
    return {};
  }
}

function mapInspeccion(db: InspeccionDB, activos: Record<string, string>): Inspeccion {
  const estado = DB_A_ESTADO[db.estado_evaluado] ?? 'BUENO';
  return {
    id: db.id_inspeccion,
    espacioId: db.id_activo,
    espacioNombre: activos[db.id_activo] ?? db.ubicacion_exacta ?? `Activo #${db.id_activo}`,
    inspector: 'Por asignar',
    fecha: (db.fecha_inspeccion || '').split('T')[0],
    puntajeGlobal: PUNTAJE_ESTADO[estado],
    itemsBuenos: 0,
    observaciones: 0,
    estado,
    checklist: [],
    notas: db.observaciones ?? undefined,
    evidencias: [],
  };
}

function payload(input: InspeccionInput): Record<string, unknown> {
  const usuario = useAuthStore.getState().session?.usuario;
  const estado = calcularEstado(input.checklist);
  return {
    id_inspector: usuario ? Number(usuario.id) : 1,
    id_activo: Number(input.espacioId),
    fecha_inspeccion: input.fecha,
    ubicacion_exacta: input.espacioNombre || `Activo #${input.espacioId}`,
    estado_evaluado: ESTADO_A_DB[estado],
    nivel_riesgo_calificado: riesgoPara(estado),
    observaciones: input.notas || null,
  };
}

export const inspeccionesService = {
  async listar(): Promise<Inspeccion[]> {
    const result = await resourcesApi.listar<InspeccionDB>('inspecciones', { pageSize: 1000 });
    const activos = await activoNombreMap();
    return result.data.map((i) => mapInspeccion(i, activos)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  async crear(input: InspeccionInput): Promise<Inspeccion> {
    const created = await resourcesApi.crear<InspeccionDB, Record<string, unknown>>('inspecciones', payload(input));
    return mapInspeccion(created, await activoNombreMap());
  },

  async actualizar(id: string, input: InspeccionInput): Promise<Inspeccion> {
    const updated = await resourcesApi.actualizar<InspeccionDB, Record<string, unknown>>('inspecciones', id, payload(input));
    return mapInspeccion(updated, await activoNombreMap());
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('inspecciones', id);
  },
};
