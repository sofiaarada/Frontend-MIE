import type { KpiDashboard } from '@/types';
import { dashboardApi } from './api/resources';

interface DashboardData {
  kpis: KpiDashboard;
  evolucion: { mes: string; completadas: number; pendientes: number }[];
  estadoEspacios: { name: string; value: number; color: string }[];
  presupuesto: { mes: string; valor: number }[];
  notificaciones: { id: string; titulo: string; descripcion: string; tipo: string; leido: boolean; fecha: string }[];
}

function mapDashboardData(data: any): DashboardData {
  const estadoColors: Record<string, string> = {
    BUENO: '#22c55e', Bueno: '#22c55e',
    REGULAR: '#f59e0b', Regular: '#f59e0b',
    DETERIORADO: '#f97316', Deteriorado: '#f97316',
    CRITICO: '#ef4444', Crítico: '#ef4444',
  };
  const paleta = ['#2563eb', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
  return {
    kpis: {
      espaciosTotales: data.kpis?.espaciosTotales ?? 0,
      espaciosVariacion: data.kpis?.espaciosVariacion ?? 0,
      activosRegistrados: data.kpis?.activosRegistrados ?? 0,
      activosNoRevisados: data.kpis?.activosNoRevisados ?? 0,
      ticketsAbiertos: data.kpis?.ticketsAbiertos ?? 0,
      ticketsUrgentes: data.kpis?.ticketsUrgentes ?? 0,
      indiceEstadoGlobal: data.kpis?.indiceEstadoGlobal ?? 0,
      indiceObjetivo: data.kpis?.indiceObjetivo ?? 85,
    },
    evolucion: (data.evolucion ?? []).map((e: any) => ({
      mes: e.mes ?? e.periodo,
      completadas: Number(e.completadas ?? 0),
      pendientes: Number(e.pendientes ?? 0),
    })),
    estadoEspacios: (data.estadoEspacios ?? []).map((e: any, i: number) => {
      const name = e.nombre ?? e.name;
      return {
        name,
        value: Number(e.cantidad ?? e.value),
        color: estadoColors[name] ?? paleta[i % paleta.length],
      };
    }),
    presupuesto: (data.presupuesto ?? []).map((p: any) => ({
      mes: p.mes,
      valor: Number(p.valor ?? 0),
    })),
    notificaciones: (data.notificaciones ?? []).map((n: any) => ({
      id: n.id ?? n.id_notificacion,
      titulo: n.titulo,
      descripcion: n.descripcion ?? n.mensaje,
      tipo: n.tipo ?? n.tipo_alerta,
      leido: n.leido ?? false,
      fecha: n.fecha ?? n.fecha_envio,
    })),
  };
}

export const dashboardService = {
  async obtenerKpis(): Promise<KpiDashboard> {
    const data = await dashboardApi.obtenerKpis();
    return mapDashboardData(data).kpis;
  },

  async obtenerEvolucionOT() {
    const data = await dashboardApi.obtenerKpis();
    return mapDashboardData(data).evolucion;
  },

  async obtenerEstadoEspacios() {
    const data = await dashboardApi.obtenerKpis();
    return mapDashboardData(data).estadoEspacios;
  },

  async obtenerPresupuesto() {
    const data = await dashboardApi.obtenerKpis();
    return mapDashboardData(data).presupuesto;
  },

  async obtenerNotificaciones() {
    const data = await dashboardApi.obtenerKpis();
    return mapDashboardData(data).notificaciones;
  },
};