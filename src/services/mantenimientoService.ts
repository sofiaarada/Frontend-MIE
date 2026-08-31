import type { Mantenimiento } from '@/types';
import { resourcesApi } from './api/resources';

export type MantenimientoInput = Omit<Mantenimiento, 'id'>;

interface MantenimientoDB {
  id_mantenimiento: string;
  id_ticket?: string;
  titulo: string;
  responsable: string;
  materiales: string;
  costo: number;
  fecha_programada: string;
  id_estado: number;
}

function mapEstado(id: number): Mantenimiento['estado'] {
  switch (id) {
    case 1: return 'PENDIENTE';
    case 2: return 'EN_PROCESO';
    case 3: return 'FINALIZADO';
    case 4: return 'CANCELADO';
    default: return 'PENDIENTE';
  }
}

function mapMantenimiento(db: MantenimientoDB): Mantenimiento {
  return {
    id: db.id_mantenimiento,
    ticketId: db.id_ticket,
    titulo: db.titulo,
    responsable: db.responsable,
    materiales: db.materiales ? db.materiales.split(',').map(m => m.trim()) : [],
    costo: db.costo,
    fechaProgramada: db.fecha_programada.split('T')[0],
    estado: mapEstado(db.id_estado),
  };
}

function mapEstadoToId(estado: Mantenimiento['estado']): number {
  switch (estado) {
    case 'PENDIENTE': return 1;
    case 'EN_PROCESO': return 2;
    case 'FINALIZADO': return 3;
    case 'CANCELADO': return 4;
  }
}

export const mantenimientoService = {
  async listar(): Promise<Mantenimiento[]> {
    const result = await resourcesApi.listar<MantenimientoDB>('mantenimientos', { pageSize: 1000 });
    return result.data.map(mapMantenimiento).sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
  },

  async crear(input: MantenimientoInput): Promise<Mantenimiento> {
    const dbInput = {
      id_ticket: input.ticketId,
      titulo: input.titulo,
      responsable: input.responsable,
      materiales: input.materiales.join(', '),
      costo: input.costo,
      fecha_programada: input.fechaProgramada,
      id_estado: mapEstadoToId(input.estado),
    };
    const created = await resourcesApi.crear<MantenimientoDB, typeof dbInput>('mantenimientos', dbInput);
    return mapMantenimiento(created);
  },

  async actualizar(id: string, input: MantenimientoInput): Promise<Mantenimiento> {
    const dbInput = {
      id_ticket: input.ticketId,
      titulo: input.titulo,
      responsable: input.responsable,
      materiales: input.materiales.join(', '),
      costo: input.costo,
      fecha_programada: input.fechaProgramada,
      id_estado: mapEstadoToId(input.estado),
    };
    const updated = await resourcesApi.actualizar<MantenimientoDB, typeof dbInput>('mantenimientos', id, dbInput);
    return mapMantenimiento(updated);
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('mantenimientos', id);
  },
};