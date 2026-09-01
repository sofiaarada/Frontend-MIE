

/** Los roles se administran desde la tabla `roles`; no se deben codificar en el cliente. */
export type Role = string;

export type EstadoInfraestructura = 'BUENO' | 'REGULAR' | 'DETERIORADO' | 'CRITICO';

export type EstadoTicket = 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Role;
  sede: string;
  activo: boolean;
  avatarUrl?: string;
  creadoEn: string;
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  espaciosCount: number;
}

export interface Espacio {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  sedeId: string;
  piso: string;
  areaM2: number;
  capacidad: number;
  estado: EstadoInfraestructura;
  fotoUrl?: string;
  ultimaInspeccion?: string;
  problemasActivos: number;
}

export interface Activo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  espacioId: string;
  espacioNombre: string;
  cantidad: number;
  estado: EstadoInfraestructura;
  responsable: string;
  valor: number;
  fechaAdquisicion: string;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  cumple: boolean;
}

export interface Inspeccion {
  id: string;
  espacioId: string;
  espacioNombre: string;
  inspector: string;
  fecha: string;
  puntajeGlobal: number;
  itemsBuenos: number;
  observaciones: number;
  estado: EstadoInfraestructura;
  checklist: ChecklistItem[];
  notas?: string;
  evidencias: string[];
}

export interface ReporteDano {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  espacioId: string;
  espacioNombre: string;
  prioridad: Prioridad;
  imagenes: string[];
  reportadoPor: string;
  fecha: string;
}

export interface Ticket {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTicket;
  espacioNombre: string;
  responsable: string;
  creadoPor: string;
  fechaCreacion: string;
  fechaVencimiento: string;
  activoId?: string;
}

export interface Mantenimiento {
  id: string;
  ticketId?: string;
  titulo: string;
  responsable: string;
  materiales: string[];
  costo: number;
  fechaProgramada: string;
  estado: EstadoTicket;
  activoId?: string;
}

export interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'Info' | 'Advertencia' | 'Critico';
  leido: boolean;
  fecha: string;
}

export interface KpiDashboard {
  espaciosTotales: number;
  espaciosVariacion: number;
  activosRegistrados: number;
  activosNoRevisados: number;
  ticketsAbiertos: number;
  ticketsUrgentes: number;
  indiceEstadoGlobal: number;
  indiceObjetivo: number;
}

export interface Paginado<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthCredentials {
  correo: string;
  password: string;
  recordarme?: boolean;
}

export interface AuthSession {
  usuario: Usuario;
  token: string;
}

export interface PerfilUsuario {
  id_usuario: string;
  documento_id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  avatar_url?: string | null;
  nombre_rol: string;
  id_institucion?: string | null;
}
