import type { ColumnaReporte } from '@/utils/exportes';
import {
  delay, mockKpi, mockActivos, mockTickets, mockIndiceEvolucion,
  mockPresupuestoComparativo,
} from './mock/mockData';
import { formatearMoneda } from '@/utils/format';

const USE_MOCK = true;

export interface DatosReporte {
  columnas: ColumnaReporte[];
  filas: Record<string, string>[];
}

const labelPrioridad = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente' };

// Cada función arma columnas + filas listas para mostrar en la vista previa
// y para exportar (PDF/Excel). El día que exista backend, cada una pasa a
// pedir estos mismos datos ya armados a un endpoint de /reportes/*.
export const reportesService = {
  async reporteMensual(): Promise<DatosReporte> {
    if (USE_MOCK) {
      await delay(400);
      return {
        columnas: [{ clave: 'indicador', titulo: 'Indicador' }, { clave: 'valor', titulo: 'Valor' }],
        filas: [
          { indicador: 'Espacios totales', valor: String(mockKpi.espaciosTotales) },
          { indicador: 'Activos registrados', valor: mockKpi.activosRegistrados.toLocaleString('es-AR') },
          { indicador: 'Tickets abiertos', valor: String(mockKpi.ticketsAbiertos) },
          { indicador: 'Tickets urgentes', valor: String(mockKpi.ticketsUrgentes) },
          { indicador: 'Índice de estado global', valor: `${mockKpi.indiceEstadoGlobal}%` },
          { indicador: 'Objetivo institucional', valor: `${mockKpi.indiceObjetivo}%` },
        ],
      };
    }
    // const { data } = await apiClient.get<DatosReporte>('/reportes/mensual');
    // return data;
    throw new Error('Backend no configurado');
  },

  async inventarioActivos(desde?: string, hasta?: string): Promise<DatosReporte> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...mockActivos];
      if (desde) data = data.filter((a) => a.fechaAdquisicion >= desde);
      if (hasta) data = data.filter((a) => a.fechaAdquisicion <= hasta);
      return {
        columnas: [
          { clave: 'codigo', titulo: 'Código' }, { clave: 'nombre', titulo: 'Activo' },
          { clave: 'categoria', titulo: 'Categoría' }, { clave: 'estado', titulo: 'Estado' },
          { clave: 'valor', titulo: 'Valor' },
        ],
        filas: data.map((a) => ({
          codigo: a.codigo, nombre: a.nombre, categoria: a.categoria, estado: a.estado, valor: formatearMoneda(a.valor),
        })),
      };
    }
    // const { data } = await apiClient.get<DatosReporte>('/reportes/inventario', { params: { desde, hasta } });
    // return data;
    throw new Error('Backend no configurado');
  },

  async otPorPrioridad(desde?: string, hasta?: string): Promise<DatosReporte> {
    if (USE_MOCK) {
      await delay(400);
      let data = [...mockTickets];
      if (desde) data = data.filter((t) => t.fechaCreacion >= desde);
      if (hasta) data = data.filter((t) => t.fechaCreacion <= hasta);
      return {
        columnas: [
          { clave: 'codigo', titulo: 'Código' }, { clave: 'titulo', titulo: 'Título' },
          { clave: 'espacio', titulo: 'Espacio' }, { clave: 'prioridad', titulo: 'Prioridad' },
          { clave: 'estado', titulo: 'Estado' },
        ],
        filas: data.map((t) => ({
          codigo: t.codigo, titulo: t.titulo, espacio: t.espacioNombre,
          prioridad: labelPrioridad[t.prioridad], estado: t.estado,
        })),
      };
    }
    // const { data } = await apiClient.get<DatosReporte>('/reportes/ot-por-categoria', { params: { desde, hasta } });
    // return data;
    throw new Error('Backend no configurado');
  },

  async presupuestoVsReal(): Promise<DatosReporte> {
    if (USE_MOCK) {
      await delay(400);
      return {
        columnas: [
          { clave: 'mes', titulo: 'Mes' }, { clave: 'presupuestado', titulo: 'Presupuestado' },
          { clave: 'real', titulo: 'Ejecutado' }, { clave: 'diferencia', titulo: 'Diferencia' },
        ],
        filas: mockPresupuestoComparativo.map((p) => ({
          mes: p.mes,
          presupuestado: formatearMoneda(p.presupuestado),
          real: formatearMoneda(p.real),
          diferencia: formatearMoneda(p.presupuestado - p.real),
        })),
      };
    }
    // const { data } = await apiClient.get<DatosReporte>('/reportes/presupuesto');
    // return data;
    throw new Error('Backend no configurado');
  },

  async indiceEvolucion() {
    if (USE_MOCK) {
      await delay(300);
      return mockIndiceEvolucion;
    }
    throw new Error('Backend no configurado');
  },

  async otAcumuladoPorPrioridad() {
    if (USE_MOCK) {
      await delay(300);
      const conteo = mockTickets.reduce<Record<string, number>>((acc, t) => {
        acc[t.prioridad] = (acc[t.prioridad] ?? 0) + 1;
        return acc;
      }, {});
      return (['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((p) => ({
        categoria: labelPrioridad[p], cantidad: conteo[p] ?? 0,
      }));
    }
    throw new Error('Backend no configurado');
  },
};