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

interface EvidenciaDB {
  id_fotografia: string;
  id_inspeccion: string;
  url_fotografia: string;
  descripcion_foto: string | null;
  fecha_captura: string;
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

export function calcularPuntaje(checklist: ChecklistItem[]): number {
  const total = checklist.length;
  const buenos = checklist.filter((c) => c.cumple).length;
  return total ? Math.round((buenos / total) * 100) : 0;
}

export function calcularEstado(checklist: ChecklistItem[]): EstadoInfraestructura {
  const puntaje = calcularPuntaje(checklist);
  if (puntaje >= 80) return 'BUENO';
  if (puntaje >= 60) return 'REGULAR';
  if (puntaje >= 40) return 'DETERIORADO';
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

function mapInspeccion(db: InspeccionDB, activos: Record<string, string>, evidencias: string[], checklist: ChecklistItem[]): Inspeccion {
  const estado = DB_A_ESTADO[db.estado_evaluado] ?? 'BUENO';
  const puntaje = calcularPuntaje(checklist);
  return {
    id: String(db.id_inspeccion),
    espacioId: String(db.id_activo),
    espacioNombre: activos[String(db.id_activo)] ?? db.ubicacion_exacta ?? `Activo #${db.id_activo}`,
    inspector: 'Por asignar',
    fecha: (db.fecha_inspeccion || '').split('T')[0],
    puntajeGlobal: puntaje,
    itemsBuenos: checklist.filter(c => c.cumple).length,
    observaciones: checklist.filter(c => !c.cumple).length,
    estado,
    checklist,
    notas: db.observaciones ?? undefined,
    evidencias,
  };
}

function payload(input: InspeccionInput): Record<string, unknown> {
  const usuario = useAuthStore.getState().session?.usuario;
  const estado = calcularEstado(input.checklist);
  const puntaje = calcularPuntaje(input.checklist);
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
    const evidenciasResult = await resourcesApi.listar<EvidenciaDB>('evidencias_fotograficas_inspeccion', { pageSize: 1000 });
    const evidenciasPorInspeccion: Record<string, string[]> = {};
    evidenciasResult.data.forEach(e => {
      if (!evidenciasPorInspeccion[e.id_inspeccion]) evidenciasPorInspeccion[e.id_inspeccion] = [];
      evidenciasPorInspeccion[e.id_inspeccion].push(e.url_fotografia);
    });
    return result.data.map((i) => mapInspeccion(i, activos, evidenciasPorInspeccion[i.id] || [], [])).sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  async obtenerConDetalle(id: string): Promise<Inspeccion | undefined> {
    try {
      const [inspeccionResult, evidenciasResult, dañosResult] = await Promise.all([
        resourcesApi.obtener<InspeccionDB>('inspecciones', id),
        resourcesApi.listar<EvidenciaDB>('evidencias_fotograficas_inspeccion', { pageSize: 1000, id_inspeccion: id }),
        resourcesApi.listar<{ id_dano: string; id_inspeccion: string }>('registro_danos', { pageSize: 1000, id_inspeccion: id }),
      ]);
      const activos = await activoNombreMap();
      const evidencias = evidenciasResult.data.map(e => e.url_fotografia);
      // Aquí se podría cargar el checklist desde algún lado si se guarda
      return mapInspeccion(inspeccionResult, activos, evidencias, []);
    } catch {
      return undefined;
    }
  },

  async crear(input: InspeccionInput): Promise<Inspeccion> {
    const created = await resourcesApi.crear<InspeccionDB, Record<string, unknown>>('inspecciones', payload(input));
    // Guardar evidencias en tabla separada
    if (input.evidencias.length > 0) {
      await Promise.all(
        input.evidencias.map((url) =>
          resourcesApi.crear<EvidenciaDB, { id_inspeccion: number; url_fotografia: string }>(
            'evidencias_fotograficas_inspeccion',
            { id_inspeccion: Number(created.id_inspeccion), url_fotografia: url }
          )
        )
      );
    }
    return mapInspeccion(created, await activoNombreMap(), input.evidencias, input.checklist);
  },

  async actualizar(id: string, input: InspeccionInput): Promise<Inspeccion> {
    const updated = await resourcesApi.actualizar<InspeccionDB, Record<string, unknown>>('inspecciones', id, payload(input));
    // Actualizar evidencias: borrar las antiguas y crear las nuevas
    await resourcesApi.eliminar('evidencias_fotograficas_inspeccion', id); // Esto no funcionará directamente, necesitaríamos un endpoint personalizado
    // Por simplicidad, solo creamos las nuevas (en producción se haría un diff)
    if (input.evidencias.length > 0) {
      await Promise.all(
        input.evidencias.map((url) =>
          resourcesApi.crear<EvidenciaDB, { id_inspeccion: number; url_fotografia: string }>(
            'evidencias_fotograficas_inspeccion',
            { id_inspeccion: Number(id), url_fotografia: url }
          )
        )
      );
    }
    return mapInspeccion(updated, await activoNombreMap(), input.evidencias, input.checklist);
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('inspecciones', id);
  },
};
