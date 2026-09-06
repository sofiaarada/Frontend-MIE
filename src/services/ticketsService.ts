import type { Ticket, EstadoTicket } from '@/types';
import { resourcesApi } from './api/resources';
import { activosService } from './activosService';
import { usuariosService } from './usuariosService';
import { useAuthStore } from '@/store/authStore';

export type TicketInput = {
  titulo: string;
  descripcion: string;
  activoId: string;
  prioridad: Ticket['prioridad'];
  estado: Ticket['estado'];
  fechaVencimiento?: string;
  responsableId?: string;
};

interface TicketDB {
  id_ticket: string;
  id_activo: string;
  id_usuario_creador: string;
  id_prioridad: number;
  id_estado: number;
  titulo: string;
  descripcion_incidente: string;
  fecha_creacion: string;
  fecha_cierre: string | null;
}

interface AsignacionDB {
  id_asignacion: string;
  id_ticket: string;
  id_tecnico: string;
}

const PRIORIDAD_A_ID: Record<Ticket['prioridad'], number> = { BAJA: 1, MEDIA: 2, ALTA: 3, URGENTE: 4 };
const ID_A_PRIORIDAD: Record<number, Ticket['prioridad']> = { 1: 'BAJA', 2: 'MEDIA', 3: 'ALTA', 4: 'URGENTE' };

const ESTADO_A_ID: Record<EstadoTicket, number> = {
  PENDIENTE: 1,
  EN_PROCESO: 3,
  FINALIZADO: 4,
  CANCELADO: 6,
};
const ID_A_ESTADO: Record<number, EstadoTicket> = {
  1: 'PENDIENTE',
  2: 'EN_PROCESO',
  3: 'EN_PROCESO',
  4: 'FINALIZADO',
  5: 'FINALIZADO',
  6: 'CANCELADO',
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

async function responsablesMap(): Promise<Record<string, { id: string; nombre: string }>> {
  try {
    const r = await usuariosService.listar({ pageSize: 1000 });
    const map: Record<string, { id: string; nombre: string }> = {};
    r.data.forEach((u) => { map[String(u.id)] = { id: String(u.id), nombre: u.nombre }; });
    return map;
  } catch {
    return {};
  }
}

async function asignacionesPorTicket(): Promise<Map<string, AsignacionDB>> {
  const map = new Map<string, AsignacionDB>();
  try {
    const r = await resourcesApi.listar<AsignacionDB>('asignaciones_tickets', { pageSize: 1000 });
    for (const a of r.data) {
      const key = String(a.id_ticket);
      if (!map.has(key)) map.set(key, a);
    }
  } catch {
    // Sin asignaciones disponibles.
  }
  return map;
}

function asignacionDe(ticketId: string, asignaciones: Map<string, AsignacionDB>, responsables: Record<string, { id: string; nombre: string }>): { responsable: string; responsableId?: string } {
  const asignacion = asignaciones.get(String(ticketId));
  if (!asignacion) return { responsable: 'Por asignar' };
  const tecnico = responsables[String(asignacion.id_tecnico)];
  return { responsable: tecnico?.nombre ?? 'Técnico asignado', responsableId: tecnico?.id ?? String(asignacion.id_tecnico) };
}

function mapTicket(db: TicketDB, activos: Record<string, string>, asignaciones: Map<string, AsignacionDB>, responsables: Record<string, { id: string; nombre: string }>): Ticket {
  const asignacion = asignacionDe(db.id_ticket, asignaciones, responsables);
  return {
    id: String(db.id_ticket),
    codigo: `OT-${db.id_ticket}`,
    titulo: db.titulo,
    descripcion: db.descripcion_incidente,
    prioridad: ID_A_PRIORIDAD[db.id_prioridad] ?? 'MEDIA',
    estado: ID_A_ESTADO[db.id_estado] ?? 'PENDIENTE',
    espacioNombre: activos[String(db.id_activo)] ?? `Activo #${db.id_activo}`,
    responsable: asignacion.responsable,
    responsableId: asignacion.responsableId,
    creadoPor: '',
    fechaCreacion: (db.fecha_creacion || '').split('T')[0],
    fechaVencimiento: (db.fecha_cierre || '').slice(0, 10),
    activoId: String(db.id_activo),
  };
}

function payload(input: TicketInput): Record<string, unknown> {
  const usuario = useAuthStore.getState().session?.usuario;
  return {
    id_activo: Number(input.activoId),
    id_prioridad: PRIORIDAD_A_ID[input.prioridad],
    id_estado: ESTADO_A_ID[input.estado],
    id_usuario_creador: usuario ? Number(usuario.id) : 1,
    titulo: input.titulo,
    descripcion_incidente: input.descripcion,
    fecha_cierre: input.fechaVencimiento || null,
  };
}

async function guardarAsignacion(ticketId: string, responsableId: string | undefined): Promise<void> {
  try {
    const existentes = await resourcesApi.listar<AsignacionDB>('asignaciones_tickets', { id_ticket: ticketId, pageSize: 5 });
    for (const a of existentes.data) {
      await resourcesApi.eliminar('asignaciones_tickets', a.id_asignacion);
    }
    if (!responsableId) return;
    const usuario = useAuthStore.getState().session?.usuario;
    await resourcesApi.crear<AsignacionDB, Record<string, unknown>>('asignaciones_tickets', {
      id_ticket: Number(ticketId),
      id_tecnico: Number(responsableId),
      id_asignador: usuario ? Number(usuario.id) : 1,
    });
  } catch {
    // Si la asignación falla, no bloquea al ticket.
  }
}

export const ticketsService = {
  async listar(filtros: { busqueda?: string; prioridad?: Ticket['prioridad'] | 'TODAS' } = {}): Promise<Ticket[]> {
    const params: Record<string, string | number | undefined> = {
      busqueda: filtros.busqueda,
      pageSize: 1000,
    };
    if (filtros.prioridad && filtros.prioridad !== 'TODAS') {
      params.id_prioridad = PRIORIDAD_A_ID[filtros.prioridad];
    }
    const result = await resourcesApi.listar<TicketDB>('tickets', params);
    const [activos, asignaciones, responsables] = await Promise.all([activoNombreMap(), asignacionesPorTicket(), responsablesMap()]);
    const prioridadDesc = (p: Ticket['prioridad']) => PRIORIDAD_A_ID[p];
    const items: Ticket[] = [];
    for (const t of result.data) {
      items.push(mapTicket(t, activos, asignaciones, responsables));
    }
    return items.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion) || (prioridadDesc(b.prioridad) - prioridadDesc(a.prioridad)) || b.id.localeCompare(a.id));
  },

  async crear(input: TicketInput): Promise<Ticket> {
    const created = await resourcesApi.crear<TicketDB, Record<string, unknown>>('tickets', payload(input));
    await guardarAsignacion(created.id_ticket, input.responsableId);
    const [activos, asignaciones, responsables] = await Promise.all([activoNombreMap(), asignacionesPorTicket(), responsablesMap()]);
    return mapTicket(created, activos, asignaciones, responsables);
  },

  async actualizar(id: string, input: TicketInput): Promise<Ticket> {
    const updated = await resourcesApi.actualizar<TicketDB, Record<string, unknown>>('tickets', id, payload(input));
    await guardarAsignacion(updated.id_ticket, input.responsableId);
    const [activos, asignaciones, responsables] = await Promise.all([activoNombreMap(), asignacionesPorTicket(), responsablesMap()]);
    return mapTicket(updated, activos, asignaciones, responsables);
  },

  async actualizarEstado(id: string, estado: EstadoTicket): Promise<Ticket> {
    const updated = await resourcesApi.actualizarParcial<TicketDB, { id_estado: number }>('tickets', id, { id_estado: ESTADO_A_ID[estado] });
    const [activos, asignaciones, responsables] = await Promise.all([activoNombreMap(), asignacionesPorTicket(), responsablesMap()]);
    return mapTicket(updated, activos, asignaciones, responsables);
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('tickets', id);
  },
};
