import type { ColumnaReporte } from '@/utils/exportes';
import { resourcesApi } from './api/resources';
import { dashboardApi } from './api/resources';

export interface DatosReporte {
  columnas: ColumnaReporte[];
  filas: Record<string, unknown>[];
}

const LABEL_PRIORIDAD: Record<number, string> = { 1: 'Baja', 2: 'Media', 3: 'Alta', 4: 'Urgente' };
const LABEL_ESTADO_ACTIVO: Record<string, string> = {
  Excelente: 'Excelente', Bueno: 'Bueno', Regular: 'Regular', Malo: 'Malo', Crítico: 'Crítico',
};

async function getDashboardData() {
  return dashboardApi.obtenerKpis();
}

async function getActivos(filters?: { desde?: string; hasta?: string }) {
  const params: Record<string, string | number | undefined> = { pageSize: 100 };
  if (filters?.desde === filters?.hasta && filters?.desde) params.fecha_registro = filters.desde;
  const result = await resourcesApi.listar<any>('activos', params);
  return result.data;
}

async function getTickets(filters?: { desde?: string; hasta?: string }) {
  const params: Record<string, string | number | undefined> = { pageSize: 100 };
  if (filters?.desde === filters?.hasta && filters?.desde) params.fecha_creacion = filters.desde;
  const result = await resourcesApi.listar<any>('tickets', params);
  return result.data;
}

async function getMantenimientos() {
  const result = await resourcesApi.listar<any>('mantenimientos', { pageSize: 100 });
  return result.data;
}

async function getMateriales() {
  const result = await resourcesApi.listar<any>('materiales_mantenimiento', { pageSize: 100 });
  return result.data;
}

async function getCategorias() {
  try {
    const result = await resourcesApi.listar<any>('categorias_activos', { pageSize: 100 });
    const map: Record<number, string> = {};
    result.data.forEach((c: any) => { map[c.id_categoria] = c.nombre_categoria; });
    return map;
  } catch { return {}; }
}

async function getEstadosTicket() {
  try {
    const result = await resourcesApi.listar<any>('estados_ticket', { pageSize: 100 });
    const map: Record<number, string> = {};
    result.data.forEach((e: any) => { map[e.id_estado] = e.nombre_estado; });
    return map;
  } catch { return {}; }
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
    const categorias = await getCategorias();
    return {
      columnas: [
        { clave: 'codigo', titulo: 'Código' }, { clave: 'nombre', titulo: 'Activo' },
        { clave: 'categoria', titulo: 'Categoría' }, { clave: 'estado', titulo: 'Estado' },
        { clave: 'riesgo', titulo: 'Nivel de riesgo' },
      ],
      filas: data.map((a: any) => ({
        codigo: a.codigo_inventario,
        nombre: a.nombre_activo,
        categoria: categorias[a.id_categoria] ?? 'Sin categoría',
        estado: LABEL_ESTADO_ACTIVO[a.estado_activo] ?? a.estado_operativo,
        riesgo: a.nivel_riesgo,
      })),
    };
  },

  async otPorPrioridad(desde?: string, hasta?: string): Promise<DatosReporte> {
    const data = await getTickets({ desde, hasta });
    const estados = await getEstadosTicket();
    return {
      columnas: [
        { clave: 'codigo', titulo: 'Código' }, { clave: 'titulo', titulo: 'Título' },
        { clave: 'prioridad', titulo: 'Prioridad' }, { clave: 'estado', titulo: 'Estado' },
      ],
      filas: data.map((t: any) => ({
        codigo: `OT-${t.id_ticket}`,
        titulo: t.titulo,
        prioridad: LABEL_PRIORIDAD[t.id_prioridad] ?? 'Media',
        estado: estados[t.id_estado] ?? String(t.id_estado),
      })),
    };
  },

  async presupuestoVsReal(): Promise<DatosReporte> {
    const presupuesto = await getPresupuestoComparativo();
    const mantenimientos = await getMantenimientos();
    const materiales = await getMateriales();

    const mesPorMantenimiento: Record<number, string> = {};
    mantenimientos.forEach((m: any) => { mesPorMantenimiento[m.id_mantenimiento] = (m.fecha_programada || '').slice(0, 7); });

    const realPorMes: Record<string, number> = {};
    materiales.forEach((mat: any) => {
      const mes = mesPorMantenimiento[mat.id_mantenimiento];
      if (!mes) return;
      realPorMes[mes] = (realPorMes[mes] ?? 0) + Number(mat.cantidad) * Number(mat.costo_unitario);
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
        const presupuestado = Number(p.valor) * 1000;
        return { mes: p.mes, presupuestado, real, diferencia: presupuestado - real };
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
      const key = LABEL_PRIORIDAD[t.id_prioridad] ?? 'Media';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return ['Baja', 'Media', 'Alta', 'Urgente'].map((p) => ({ categoria: p, cantidad: conteo[p] ?? 0 }));
  },
};
