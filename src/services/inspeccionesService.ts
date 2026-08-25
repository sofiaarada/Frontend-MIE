import type { Inspeccion, ChecklistItem } from '@/types';
import { delay, mockInspecciones } from './mock/mockData';

const USE_MOCK = true;

const db: Inspeccion[] = [...mockInspecciones];

export type InspeccionInput = {
  espacioId: string;
  espacioNombre: string;
  inspector: string;
  fecha: string;
  checklist: ChecklistItem[];
  notas?: string;
  evidencias: string[];
};


const calcularResultado = (checklist: ChecklistItem[]) => {
  const total = checklist.length || 1;
  const itemsBuenos = checklist.filter((c) => c.cumple).length;
  const observaciones = checklist.length - itemsBuenos;
  const puntajeGlobal = Math.round((itemsBuenos / total) * 100);
  const estado: Inspeccion['estado'] =
    puntajeGlobal >= 80 ? 'BUENO' : puntajeGlobal >= 60 ? 'REGULAR' : puntajeGlobal >= 40 ? 'DETERIORADO' : 'CRITICO';
  return { itemsBuenos, observaciones, puntajeGlobal, estado };
};

export const inspeccionesService = {
  async listar(): Promise<Inspeccion[]> {
    if (USE_MOCK) {
      await delay(400);
      return [...db].sort((a, b) => b.fecha.localeCompare(a.fecha));
    }
    
    throw new Error('Backend no configurado');
  },

  async crear(input: InspeccionInput): Promise<Inspeccion> {
    if (USE_MOCK) {
      await delay(500);
      const nueva: Inspeccion = { ...input, id: `i${Date.now()}`, ...calcularResultado(input.checklist) };
      db.unshift(nueva);
      return nueva;
    }
    
    throw new Error('Backend no configurado');
  },

  async actualizar(id: string, input: InspeccionInput): Promise<Inspeccion> {
    if (USE_MOCK) {
      await delay(500);
      const index = db.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Evaluación no encontrada.');
      db[index] = { ...db[index], ...input, ...calcularResultado(input.checklist) };
      return db[index];
    }
    throw new Error('Backend no configurado');
  },

  async eliminar(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const index = db.findIndex((i) => i.id === id);
      if (index !== -1) db.splice(index, 1);
      return;
    }
    throw new Error('Backend no configurado');
  },
};