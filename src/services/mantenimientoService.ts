import type { Mantenimiento, EstadoTicket } from '@/types';
import { resourcesApi } from './api/resources';
import { activosService } from './activosService';
import { useAuthStore } from '@/store/authStore';

export type MantenimientoInput = {
  titulo: string;
  activoId: string;
  fechaProgramada: string;
  estado: EstadoTicket;
};

interface MantenimientoDB {
  id_mantenimiento: string;
  id_ticket?: string | null;
  id_activo: string;
  id_tecnico: string;
  id_tipo_mantenimiento: number;
  fecha_programada: string;
  estado_mantenimiento: string;
  resumen_trabajo: string | null;
}

interface MaterialDB {
  id_material: string;
  id_mantenimiento: string;
  nombre_material: string;
  cantidad: number;
  costo_unitario: number;
}

const ESTADO_MANT_A_DB: Record<EstadoTicket, string> = {
  PENDIENTE: 'Programado',
  EN_PROCESO: 'En Proceso',
  FINALIZADO: 'Completado',
  CANCELADO: 'Rechazado',
};
const DB_A_ESTADO: Record<string, EstadoTicket> = {
  Programado: 'PENDIENTE',
  'En Proceso': 'EN_PROCESO',
  'Pendiente Aprobacion': 'EN_PROCESO',
  Aprobado: 'EN_PROCESO',
  Completado: 'FINALIZADO',
  Rechazado: 'CANCELADO',
};

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

async function materialesDe(id: string): Promise<MaterialDB[]> {
  try {
    const r = await resourcesApi.listar<MaterialDB>('materiales_mantenimiento', { id_mantenimiento: id, pageSize: 100 });
    return r.data;
  } catch {
    return [];
  }
}

function mapMantenimiento(db: MantenimientoDB, materiales: MaterialDB[], activos: Record<string, string>): Mantenimiento {
  const costo = materiales.reduce((acc, m) => acc + Number(m.cantidad) * Number(m.costo_unitario), 0);
  return {
    id: db.id_mantenimiento,
    ticketId: db.id_ticket ?? undefined,
    titulo: db.resumen_trabajo || activos[db.id_activo] || `Mantenimiento #${db.id_mantenimiento}`,
    responsable: 'Por asignar',
    materiales: materiales.map((m) => m.nombre_material),
    costo,
    fechaProgramada: (db.fecha_programada || '').split('T')[0],
    estado: DB_A_ESTADO[db.estado_mantenimiento as string] ?? 'PENDIENTE',
    activoId: db.id_activo,
  };
}

function payload(input: MantenimientoInput): Record<string, unknown> {
  const usuario = useAuthStore.getState().session?.usuario;
  return {
    id_activo: Number(input.activoId),
    id_tecnico: usuario ? Number(usuario.id) : 1,
    id_tipo_mantenimiento: 1,
    fecha_programada: input.fechaProgramada,
    estado_mantenimiento: ESTADO_MANT_A_DB[input.estado] ?? 'Programado',
    resumen_trabajo: input.titulo,
  };
}

export const mantenimientoService = {
  async listar(): Promise<Mantenimiento[]> {
    const result = await resourcesApi.listar<MantenimientoDB>('mantenimientos', { pageSize: 1000 });
    const activos = await activoNombreMap();
    const items: Mantenimiento[] = [];
    for (const db of result.data) {
      items.push(mapMantenimiento(db, await materialesDe(db.id_mantenimiento), activos));
    }
    return items.sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
  },

  async crear(input: MantenimientoInput): Promise<Mantenimiento> {
    const created = await resourcesApi.crear<MantenimientoDB, Record<string, unknown>>('mantenimientos', payload(input));
    return mapMantenimiento(created, [], await activoNombreMap());
  },

  async actualizar(id: string, input: MantenimientoInput): Promise<Mantenimiento> {
    const updated = await resourcesApi.actualizar<MantenimientoDB, Record<string, unknown>>('mantenimientos', id, payload(input));
    return mapMantenimiento(updated, await materialesDe(id), await activoNombreMap());
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('mantenimientos', id);
  },
};
