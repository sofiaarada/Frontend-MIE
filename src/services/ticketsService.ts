import type { Ticket } from '@/types';
import { resourcesApi } from './api/resources';

export interface FiltrosTickets {
  busqueda?: string;
  prioridad?: Ticket['prioridad'] | 'TODAS';
}

export type TicketInput = Omit<Ticket, 'id' | 'codigo' | 'fechaCreacion'>;

interface TicketDB {
  id_ticket: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  id_prioridad: number;
  id_estado: number;
  id_espacio: string;
  espacio_nombre?: string;
  responsable: string;
  creado_por: string;
  fecha_creacion: string;
  fecha_vencimiento: string;
}

function mapPrioridad(id: number): Ticket['prioridad'] {
  switch (id) {
    case 1: return 'BAJA';
    case 2: return 'MEDIA';
    case 3: return 'ALTA';
    case 4: return 'URGENTE';
    default: return 'MEDIA';
  }
}

function mapEstado(id: number): Ticket['estado'] {
  switch (id) {
    case 1: return 'PENDIENTE';
    case 2: return 'EN_PROCESO';
    case 3: return 'FINALIZADO';
    case 4: return 'CANCELADO';
    default: return 'PENDIENTE';
  }
}

function mapTicket(db: TicketDB): Ticket {
  return {
    id: db.id_ticket,
    codigo: db.codigo,
    titulo: db.titulo,
    descripcion: db.descripcion,
    prioridad: mapPrioridad(db.id_prioridad),
    estado: mapEstado(db.id_estado),
    espacioNombre: db.espacio_nombre ?? '',
    responsable: db.responsable,
    creadoPor: db.creado_por,
    fechaCreacion: db.fecha_creacion.split('T')[0],
    fechaVencimiento: db.fecha_vencimiento,
  };
}

function mapPrioridadToId(prioridad: Ticket['prioridad']): number {
  switch (prioridad) {
    case 'BAJA': return 1;
    case 'MEDIA': return 2;
    case 'ALTA': return 3;
    case 'URGENTE': return 4;
  }
}

function mapEstadoToId(estado: Ticket['estado']): number {
  switch (estado) {
    case 'PENDIENTE': return 1;
    case 'EN_PROCESO': return 2;
    case 'FINALIZADO': return 3;
    case 'CANCELADO': return 4;
  }
}

export const ticketsService = {
  async listar(filtros: FiltrosTickets = {}): Promise<Ticket[]> {
    const params: Record<string, string | number | undefined> = {
      busqueda: filtros.busqueda,
      pageSize: 1000,
    };
    if (filtros.prioridad && filtros.prioridad !== 'TODAS') {
      params.id_prioridad = mapPrioridadToId(filtros.prioridad);
    }
    const result = await resourcesApi.listar<TicketDB>('tickets', params);
    return result.data.map(mapTicket).sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  },

  async crear(input: TicketInput): Promise<Ticket> {
    const dbInput = {
      titulo: input.titulo,
      descripcion: input.descripcion,
      id_prioridad: mapPrioridadToId(input.prioridad),
      id_estado: 1,
      id_espacio: input.espacioNombre,
      responsable: input.responsable,
      creado_por: input.creadoPor,
      fecha_vencimiento: input.fechaVencimiento,
    };
    const created = await resourcesApi.crear<TicketDB, typeof dbInput>('tickets', dbInput);
    return mapTicket(created);
  },

  async actualizar(id: string, input: TicketInput): Promise<Ticket> {
    const dbInput = {
      titulo: input.titulo,
      descripcion: input.descripcion,
      id_prioridad: mapPrioridadToId(input.prioridad),
      id_estado: mapEstadoToId(input.estado),
      id_espacio: input.espacioNombre,
      responsable: input.responsable,
      creado_por: input.creadoPor,
      fecha_vencimiento: input.fechaVencimiento,
    };
    const updated = await resourcesApi.actualizar<TicketDB, typeof dbInput>('tickets', id, dbInput);
    return mapTicket(updated);
  },

  async actualizarEstado(id: string, estado: Ticket['estado']): Promise<Ticket> {
    const dbInput = {
      id_estado: mapEstadoToId(estado),
    };
    const updated = await resourcesApi.actualizar<TicketDB, typeof dbInput>('tickets', id, dbInput);
    return mapTicket(updated);
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('tickets', id);
  },
};