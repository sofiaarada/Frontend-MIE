import type { ColumnaReporte } from '@/utils/exportes';
import { resourcesApi } from './api/resources';
import { dashboardApi } from './api/resources';

export interface DatosReporte {
  columnas: ColumnaReporte[];
  filas: Record<string, unknown>[];
}

const labelPrioridad = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente' };

async function getDashboardData() {
  const data = await dashboardApi.obtenerKpis();
  return data;
}

async function getActivos(filters?: { desde?: string; hasta?: string }) {
  const params: Record<string, string | number | undefined> = { pageSize: 1000 };
  if (filters?.desde) params.fecha_adquisicion = filters.desde;
  if (filters?.hasta) params.fecha_adquisicion = filters.hasta;
  const result = await resourcesApi.listar<any>('activos', params);
  return result.data;
}

async function getTickets(filters?: { desde?: string; hasta?: string }) {
  const params: Record<string, string | number | undefined> = { pageSize: 1000 };
  if (filters?.desde) params.fecha_creacion = filters.desde;
  if (filters?.hasta) params.fecha_creacion = filters.hasta;
  const result = await resourcesApi.listar<any>('tickets', params);
  return result.data;
}

async function getMantenimientos(filters?: { desde?: string; hasta?: string }) {
  const params: Record<string, string | number | undefined> = { pageSize: 1000 };
  if (filters?.desde) params.fecha_programada = filters.desde;
  if (filters?.hasta) params.fecha_programada = filters.hasta;
  const result = await resourcesApi.listar<any>('mantenimientos', params);
  return result.data;
}

async function getIndiceEvolucion() {
  const data = await dashboardApi.obtenerKpis();
  return data.evolucion ?? [];
}

async function getPresupuestoComparativo() {
  const data = await dashboardApi.obtenerKpis();
  return data.presupuesto ?? [];
}

export const reportesService = {
  async reporteMensual(): Promise<DatosReporte> {
    const kpis = await getDashboardData();
    return {
      columnas: [{ clave: 'indicador', titulo: 'Indicador' }, { clave: 'valor', titulo: 'Valor' }],
      filas: [
        { indicador: 'Espacios totales', valor: String(kpis.espaciosTotales) },
        { indicador: 'Activos registrados', valor: kpis.activosRegistrados.toLocaleString('es-AR') },
        { indicador: 'Tickets abiertos', valor: String(kpis.ticketsAbiertos) },
        { indicador: 'Tickets urgentes', valor: String(kpis.ticketsUrgentes) },
        { indicador: 'Índice de estado global', valor: `${kpis.indiceEstadoGlobal}%` },
        { indicador: 'Objetivo institucional', valor: `${kpis.indiceObjetivo}%` },
      ],
    };
  },

  async inventarioActivos(desde?: string, hasta?: string): Promise<DatosReporte> {
    const data = await getActivos({ desde, hasta });
    return {
      columnas: [
        { clave: 'codigo', titulo: 'Código' }, { clave: 'nombre', titulo: 'Activo' },
        { clave: 'categoria', titulo: 'Categoría' }, { clave: 'estado', titulo: 'Estado' },
        { clave: 'valor', titulo: 'Valor', tipo: 'moneda' },
      ],
      filas: data.map((a: any) => ({
        codigo: a.codigo, nombre: a.nombre, categoria: a.categoria, estado: a.estado_activo, valor: a.valor,
      })),
    };
  },

  async otPorPrioridad(desde?: string, hasta?: string): Promise<DatosReporte> {
    const data = await getTickets({ desde, hasta });
    return {
      columnas: [
        { clave: 'codigo', titulo: 'Código' }, { clave: 'titulo', titulo: 'Título' },
        { clave: 'espacio', titulo: 'Espacio' }, { clave: 'prioridad', titulo: 'Prioridad' },
        { clave: 'estado', titulo: 'Estado' },
      ],
      filas: data.map((t: any) => ({
        codigo: t.codigo, titulo: t.titulo, espacio: t.espacio_nombre,
        prioridad: labelPrioridad[t.id_prioridad as keyof typeof labelPrioridad] ?? 'Media', estado: t.id_estado,
      })),
    };
  },

  async presupuestoVsReal(): Promise<DatosReporte> {
    const presupuesto = await getPresupuestoComparativo();
    const mantenimientos = await getMantenimientos();
    const realPorMes: Record<string, number> = {};
    mantenimientos.forEach((m: any) => {
      const mes = m.fecha_programada.slice(0, 7);
      realPorMes[mes] = (realPorMes[mes] ?? 0) + Number(m.costo);
    });
    return {
      columnas: [
        { clave: 'mes', titulo: 'Mes' },
        { clave: 'presupuestado', titulo: 'Presupuestado', tipo: 'moneda' },
        { clave: 'real', titulo: 'Ejecutado', tipo: 'moneda' },
        { clave: 'diferencia', titulo: 'Diferencia', tipo: 'moneda' },
      ],
      filas: presupuesto.map((p: any) => {
        const real = realPorMes[p.mes] ?? 0;
        const presupuestado = p.valor * 1000;
        return {
          mes: p.mes,
          presupuestado,
          real,
          diferencia: presupuestado - real,
        };
      }),
    };
  },

  async indiceEvolucion() {
    const data = await getIndiceEvolucion();
    return data.map((e: any) => ({ mes: e.mes, indice: e.completadas }));
  },

  async otAcumuladoPorPrioridad() {
    const tickets = await getTickets();
    const conteo = tickets.reduce<Record<string, number>>((acc, t) => {
      const key = t.id_prioridad === 1 ? 'BAJA' : t.id_prioridad === 2 ? 'MEDIA' : t.id_prioridad === 3 ? 'ALTA' : 'URGENTE';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return (['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((p) => ({
      categoria: labelPrioridad[p], cantidad: conteo[p] ?? 0,
    }));
  },
};