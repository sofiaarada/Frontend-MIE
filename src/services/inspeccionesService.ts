import type { Inspeccion, ChecklistItem } from '@/types';
import { resourcesApi } from './api/resources';

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
  id_espacio: string;
  espacio_nombre?: string;
  inspector: string;
  fecha: string;
  puntaje_global: number;
  items_buenos: number;
  observaciones: number;
  estado: Inspeccion['estado'];
  checklist: ChecklistItem[];
  notas?: string;
  evidencias: string[];
}

function mapInspeccion(db: InspeccionDB): Inspeccion {
  return {
    id: db.id_inspeccion,
    espacioId: db.id_espacio,
    espacioNombre: db.espacio_nombre ?? '',
    inspector: db.inspector,
    fecha: db.fecha.split('T')[0],
    puntajeGlobal: db.puntaje_global,
    itemsBuenos: db.items_buenos,
    observaciones: db.observaciones,
    estado: db.estado,
    checklist: db.checklist,
    notas: db.notas,
    evidencias: db.evidencias,
  };
}

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
    const result = await resourcesApi.listar<InspeccionDB>('inspecciones', { pageSize: 1000 });
    return result.data.map(mapInspeccion).sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  async crear(input: InspeccionInput): Promise<Inspeccion> {
    const resultado = calcularResultado(input.checklist);
    const dbInput = {
      id_espacio: input.espacioId,
      inspector: input.inspector,
      fecha: input.fecha,
      puntaje_global: resultado.puntajeGlobal,
      items_buenos: resultado.itemsBuenos,
      observaciones: resultado.observaciones,
      estado: resultado.estado,
      checklist: input.checklist,
      notas: input.notas,
      evidencias: input.evidencias,
    };
    const created = await resourcesApi.crear<InspeccionDB, typeof dbInput>('inspecciones', dbInput);
    return mapInspeccion(created);
  },

  async actualizar(id: string, input: InspeccionInput): Promise<Inspeccion> {
    const resultado = calcularResultado(input.checklist);
    const dbInput = {
      id_espacio: input.espacioId,
      inspector: input.inspector,
      fecha: input.fecha,
      puntaje_global: resultado.puntajeGlobal,
      items_buenos: resultado.itemsBuenos,
      observaciones: resultado.observaciones,
      estado: resultado.estado,
      checklist: input.checklist,
      notas: input.notas,
      evidencias: input.evidencias,
    };
    const updated = await resourcesApi.actualizar<InspeccionDB, typeof dbInput>('inspecciones', id, dbInput);
    return mapInspeccion(updated);
  },

  async eliminar(id: string): Promise<void> {
    await resourcesApi.eliminar('inspecciones', id);
  },
};