import { apiClient } from './client';
import type { Paginado } from '@/types';

export interface ListParams {
  page?: number;
  pageSize?: number;
  busqueda?: string;
  [key: string]: string | number | undefined;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export const resourcesApi = {
  listar: async <T>(resource: string, params: ListParams = {}): Promise<Paginado<T>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.busqueda) searchParams.set('busqueda', params.busqueda);
    Object.entries(params).forEach(([key, value]) => {
      if (!['page', 'pageSize', 'busqueda'].includes(key) && value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
    const response = await apiClient.get<ApiResponse<T[]>>(`/api/${resource}?${searchParams.toString()}`);
    return {
      data: response.data.data,
      total: response.data.total ?? response.data.data.length,
      page: response.data.page ?? 1,
      pageSize: response.data.pageSize ?? response.data.data.length,
    };
  },

  obtener: async <T>(resource: string, id: string | number): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(`/api/${resource}/${id}`);
    return response.data.data;
  },

  crear: async <T, TInput>(resource: string, data: TInput): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(`/api/${resource}`, data);
    return response.data.data;
  },

  actualizar: async <T, TInput>(resource: string, id: string | number, data: TInput): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(`/api/${resource}/${id}`, data);
    return response.data.data;
  },

  actualizarParcial: async <T, TInput>(resource: string, id: string | number, data: TInput): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(`/api/${resource}/${id}`, data);
    return response.data.data;
  },

  eliminar: async (resource: string, id: string | number): Promise<void> => {
    await apiClient.delete(`/api/${resource}/${id}`);
  },
};

export const dashboardApi = {
  obtenerKpis: async (): Promise<any> => {
    const response = await apiClient.get<any>('/api/dashboard');
    // El dashboard responde directamente el objeto de indicadores, no { data }.
    return response.data;
  },
};

// Auth endpoints devuelven respuesta directa { token, usuario }, no { data: ... }
export const authApi = {
  login: async (correo: string, password: string) => {
    const response = await apiClient.post<{ token: string; usuario: any }>('/api/auth/login', { email: correo, password });
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get<{ usuario: any }>('/api/auth/me');
    return response.data.usuario;
  },
};
