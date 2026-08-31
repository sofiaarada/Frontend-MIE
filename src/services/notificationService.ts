import { apiClient } from './api/client';
import type { Notificacion } from '@/types';

export const notificationService = {
  async listar(): Promise<Notificacion[]> { const { data } = await apiClient.get<{ data: Notificacion[] }>('/api/notifications'); return data.data; },
  async marcarLeida(id: string): Promise<void> { await apiClient.patch(`/api/notifications/${id}/read`); },
  async marcarTodasLeidas(): Promise<void> { await apiClient.patch('/api/notifications/read-all'); },
  async avisarModerador(mensaje: string): Promise<void> { await apiClient.post('/api/notifications/moderator', { mensaje }); },
};
