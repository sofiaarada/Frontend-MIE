import type { Ticket, EstadoTicket } from '@/types';
import { resourcesApi } from './api/resources';
import { activosService } from './activosService';
import { useAuthStore } from '@/store/authStore';

export type TicketInput = {
  titulo: string;
  descripcion: string;
  activoId: string;
  prioridad: Ticket['prioridad'];
  estado: Ticket['estado'];
  fechaVencimiento?: string;
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

function mapTicket(db: TicketDB, activos: Record<string, string>): Ticket {
  return {
    id: db.id_ticket,
    codigo: `OT-${db.id_ticket}`,
    titulo: db.titulo,
    descripcion: db.descripcion_incidente,
    prioridad: ID_A_PRIORIDAD[db.id_prioridad] ?? 'MEDIA',
    estado: ID_A_ESTADO[db.id_estado] ?? 'PENDIENTE',
    espacioNombre: activos[db.id_activo] ?? `Activo #${db.id_activo}`,
    responsable: 'Por asignar',
    creadoPor: '',
    fechaCreacion: (db.fecha_creacion || '').split('T')[0],
    fechaVencimiento: db.fecha_cierre || '',
    activoId: db.id_activo,
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
    const activos = await activoNombreMap();
    const prioridadDesc = (p: Ticket['prioridad']) => PRIORIDAD_A_ID[p];
    return result.data
      .map((t) => mapTicket(t, activos))
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion) || (prioridadDesc(b.prioridad) - prioridadDesc(a.prioridad)) || b.id.localeCompare(a.id));
  },

  async crear(input: TicketInput): Promise<Ticket> {
    const created = await resourcesApi.crear<TicketDB, Record<string, unknown>>('tickets', payload(input));
    return mapTicket(created, await activoNombreMap());
  },

  async actualizar(id: string, input: TicketInput): Promise<Ticket> {
    const updated = await resourcesApi.actualizar<TicketDB, Record<string, unknown>>('tickets', id, payload(input));
    return mapTicket(updated, await activoNombreMap());
  },

  async actualizarEstado(id: string, estado: EstadoTicket): Promise<Ticket> {
    const updated = await resourcesApi.actualizarParcial<TicketDB, { id_estado: number }>('tickets', id, { id_estado: ESTADO_A_ID[estado] });
    return mapTicket(updated, await activoNombreMap());
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('tickets', id);
  },
};
