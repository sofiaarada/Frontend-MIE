import type { Mantenimiento, EstadoTicket } from '@/types';
import { resourcesApi } from './api/resources';
import { activosService } from './activosService';
import { usuariosService } from './usuariosService';
import { useAuthStore } from '@/store/authStore';

export type MantenimientoInput = {
  titulo: string;
  activoId: string;
  fechaProgramada: string;
  estado: EstadoTicket;
  responsableId?: string;
  materiales?: string;
  costo?: number;
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
  costo_estimado?: string | number | null;
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

async function responsablesMap(): Promise<Record<string, string>> {
  try {
    const r = await usuariosService.listar({ pageSize: 1000 });
    const map: Record<string, string> = {};
    r.data.forEach((u) => { map[u.id] = u.nombre; });
    return map;
  } catch {
    const usuario = useAuthStore.getState().session?.usuario;
    return usuario ? { [usuario.id]: usuario.nombre } : {};
  }
}

function mapMantenimiento(db: MantenimientoDB, materiales: MaterialDB[], activos: Record<string, string>, responsables: Record<string, string>): Mantenimiento {
  const costoMateriales = materiales.reduce((acc, m) => acc + Number(m.cantidad) * Number(m.costo_unitario), 0);
  return {
    id: db.id_mantenimiento,
    ticketId: db.id_ticket ?? undefined,
    titulo: db.resumen_trabajo || activos[db.id_activo] || `Mantenimiento #${db.id_mantenimiento}`,
    responsable: responsables[db.id_tecnico] ?? 'Por asignar',
    materiales: materiales.map((m) => m.nombre_material),
    costo: Number(db.costo_estimado ?? 0) || costoMateriales,
    fechaProgramada: (db.fecha_programada || '').split('T')[0],
    estado: DB_A_ESTADO[db.estado_mantenimiento as string] ?? 'PENDIENTE',
    activoId: db.id_activo,
  };
}

let tipoMantenimientoId: number | null = null;

async function idTipoMantenimiento(): Promise<number> {
  if (tipoMantenimientoId) return tipoMantenimientoId;
  try {
    const r = await resourcesApi.listar<{ id_tipo_mantenimiento: number }>('tipos_mantenimiento', { pageSize: 10 });
    const tipos = r.data;
    const correctivo = tipos.find((t) => Number(t.id_tipo_mantenimiento) === 1);
    tipoMantenimientoId = correctivo ? 1 : (tipos[0]?.id_tipo_mantenimiento ?? 1);
  } catch {
    tipoMantenimientoId = 1;
  }
  return tipoMantenimientoId;
}

async function payload(input: MantenimientoInput): Promise<Record<string, unknown>> {
  const usuario = useAuthStore.getState().session?.usuario;
  return {
    id_activo: Number(input.activoId),
    id_tecnico: input.responsableId ? Number(input.responsableId) : (usuario ? Number(usuario.id) : 1),
    id_tipo_mantenimiento: await idTipoMantenimiento(),
    costo_estimado: Number(input.costo ?? 0),
    fecha_programada: input.fechaProgramada,
    estado_mantenimiento: ESTADO_MANT_A_DB[input.estado] ?? 'Programado',
    resumen_trabajo: input.titulo,
  };
}

async function guardarMateriales(id: string, materiales: string): Promise<MaterialDB[]> {
  const lista = (materiales ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const existentes = await materialesDe(id);
  for (const m of existentes) {
    await resourcesApi.eliminar('materiales_mantenimiento', m.id_material);
  }
  const creados: MaterialDB[] = [];
  for (const nombre of lista) {
    const creado = await resourcesApi.crear<MaterialDB, Record<string, unknown>>('materiales_mantenimiento', {
      id_mantenimiento: Number(id),
      nombre_material: nombre,
      cantidad: 1,
      unidad_medida: 'Und',
      costo_unitario: 0,
    });
    creados.push(creado);
  }
  return creados;
}

export const mantenimientoService = {
  async listar(): Promise<Mantenimiento[]> {
    const result = await resourcesApi.listar<MantenimientoDB>('mantenimientos', { pageSize: 1000 });
    const activos = await activoNombreMap();
    const responsables = await responsablesMap();
    const items: Mantenimiento[] = [];
    for (const db of result.data) {
      items.push(mapMantenimiento(db, await materialesDe(db.id_mantenimiento), activos, responsables));
    }
    return items.sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
  },

  async crear(input: MantenimientoInput): Promise<Mantenimiento> {
    const created = await resourcesApi.crear<MantenimientoDB, Record<string, unknown>>('mantenimientos', await payload(input));
    const materiales = await guardarMateriales(created.id_mantenimiento, input.materiales ?? '');
    const activos = await activoNombreMap();
    const responsables = await responsablesMap();
    return mapMantenimiento(created, materiales, activos, responsables);
  },

  async actualizar(id: string, input: MantenimientoInput): Promise<Mantenimiento> {
    const updated = await resourcesApi.actualizar<MantenimientoDB, Record<string, unknown>>('mantenimientos', id, await payload(input));
    const materiales = await guardarMateriales(id, input.materiales ?? '');
    const activos = await activoNombreMap();
    const responsables = await responsablesMap();
    return mapMantenimiento(updated, materiales, activos, responsables);
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('mantenimientos', id);
  },
};
