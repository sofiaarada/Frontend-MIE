import type { Ticket } from '@/types';
import { delay, mockTickets } from './mock/mockData';

const USE_MOCK = true;

const db: Ticket[] = [...mockTickets];

export interface FiltrosTickets {
  busqueda?: string;
  prioridad?: Ticket['prioridad'] | 'TODAS';
}

export type TicketInput = Omit<Ticket, 'id' | 'codigo' | 'fechaCreacion'>;

export const ticketsService = {
  async listar(filtros: FiltrosTickets = {}): Promise<Ticket[]> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...db];
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        data = data.filter((t) => t.titulo.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q));
      }
      if (filtros.prioridad && filtros.prioridad !== 'TODAS') {
        data = data.filter((t) => t.prioridad === filtros.prioridad);
      }
      return data.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
    }
   
    throw new Error('Backend no configurado');
  },

  async crear(input: TicketInput): Promise<Ticket> {
    if (USE_MOCK) {
      await delay(500);
      const correlativo = 122 + db.length;
      const nuevo: Ticket = {
        ...input,
        id: `t${Date.now()}`,
        codigo: `OT-2026-${correlativo}`,
        fechaCreacion: new Date().toISOString().slice(0, 10),
      };
      db.unshift(nuevo);
      return nuevo;
    }
    
    throw new Error('Backend no configurado');
  },

  async actualizar(id: string, input: TicketInput): Promise<Ticket> {
    if (USE_MOCK) {
      await delay(500);
      const index = db.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Ticket no encontrado.');
      db[index] = { ...db[index], ...input };
      return db[index];
    }
    throw new Error('Backend no configurado');
  },

  async actualizarEstado(id: string, estado: Ticket['estado']): Promise<Ticket> {
    if (USE_MOCK) {
      await delay(250);
      const index = db.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Ticket no encontrado.');
      db[index] = { ...db[index], estado };
      return db[index];
    }
    
    throw new Error('Backend no configurado');
  },

  async eliminar(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = db.findIndex((t) => t.id === id);
      if (index !== -1) db.splice(index, 1);
      return;
    }
    throw new Error('Backend no configurado');
  },
};