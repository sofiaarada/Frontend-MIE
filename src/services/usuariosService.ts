import { apiClient } from './api/client';
import type { Usuario, Paginado } from '@/types';

export interface RolSistema { id_rol: number; nombre_rol: string; descripcion?: string; }
export interface UsuarioInput { tipo_documento: string; documento_id: string; nombres: string; apellidos: string; email: string; telefono?: string; id_rol: number; id_institucion?: string; estado: 'Activo' | 'Inactivo'; password?: string; }
export type UsuarioAdmin = Usuario & UsuarioInput;
export interface FiltrosUsuarios { busqueda?: string; id_rol?: number; page?: number; pageSize?: number; }
interface UsuarioDB extends Omit<UsuarioInput, 'id_institucion'> { id_usuario: string; id_institucion?: string | null; nombre_rol: string; fecha_creacion: string; }

const mapUsuario = (db: UsuarioDB): UsuarioAdmin => ({
  id: db.id_usuario, nombre: `${db.nombres} ${db.apellidos}`, correo: db.email, rol: db.nombre_rol, sede: db.id_institucion ?? '', activo: db.estado === 'Activo', avatarUrl: undefined, creadoEn: db.fecha_creacion?.split('T')[0] ?? '',
  tipo_documento: db.tipo_documento, documento_id: db.documento_id, nombres: db.nombres, apellidos: db.apellidos, email: db.email, telefono: db.telefono ?? '', id_rol: db.id_rol, id_institucion: db.id_institucion ?? '', estado: db.estado,
});

export const usuariosService = {
  async listar(filtros: FiltrosUsuarios = {}): Promise<Paginado<UsuarioAdmin>> {
    const { data } = await apiClient.get<{ data: UsuarioDB[]; total: number; page: number; pageSize: number }>('/api/admin/users', { params: filtros });
    return { ...data, data: data.data.map(mapUsuario) };
  },
  async roles(): Promise<RolSistema[]> { const { data } = await apiClient.get<{ data: RolSistema[] }>('/api/admin/users/roles'); return data.data; },
  async crear(input: UsuarioInput): Promise<UsuarioAdmin> { const { data } = await apiClient.post<{ data: UsuarioDB }>('/api/admin/users', input); return mapUsuario(data.data); },
  async actualizar(id: string, input: UsuarioInput): Promise<UsuarioAdmin> { const { data } = await apiClient.put<{ data: UsuarioDB }>(`/api/admin/users/${id}`, input); return mapUsuario(data.data); },
  async cambiarEstado(id: string, estado: UsuarioInput['estado']): Promise<UsuarioAdmin> { const { data } = await apiClient.patch<{ data: UsuarioDB }>(`/api/admin/users/${id}/status`, { estado }); return mapUsuario(data.data); },
};
