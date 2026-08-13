import type { KpiDashboard } from '@/types';
import {
  delay, mockKpi, mockEvolucionOT, mockEstadoEspacios,
  mockPresupuesto, mockNotificaciones,
} from './mock/mockData';

const USE_MOCK = true;

export const dashboardService = {
  async obtenerKpis(): Promise<KpiDashboard> {
    if (USE_MOCK) {
      await delay(500);
      return mockKpi;
    }
   
    throw new Error('Backend no configurado');
  },

  async obtenerEvolucionOT() {
    if (USE_MOCK) {
      await delay(500);
      return mockEvolucionOT;
    }
    throw new Error('Backend no configurado');
  },

  async obtenerEstadoEspacios() {
    if (USE_MOCK) {
      await delay(500);
      return mockEstadoEspacios;
    }
    throw new Error('Backend no configurado');
  },

  async obtenerPresupuesto() {
    if (USE_MOCK) {
      await delay(500);
      return mockPresupuesto;
    }
    throw new Error('Backend no configurado');
  },

  async obtenerNotificaciones() {
    if (USE_MOCK) {
      await delay(300);
      return mockNotificaciones;
    }
    throw new Error('Backend no configurado');
  },
};
