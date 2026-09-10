import {
  LayoutDashboard, Building2, Boxes, ClipboardCheck,
  Wrench, Ticket as TicketIcon, BarChart3, Users,
  Settings, Shield, FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getRoleLevel, MODULE_PERMISSIONS } from '@/utils/permissions';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string;
  roles?: ('administrador' | 'rector' | 'coordinador' | 'supervisor' | 'tecnico')[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.ver' },
  { label: 'Espacios', path: '/espacios', icon: Building2, permission: 'espacios.ver' },
  { label: 'Activos', path: '/activos', icon: Boxes, permission: 'activos.ver' },
  { label: 'Tickets', path: '/tickets', icon: TicketIcon, permission: 'tickets.ver' },
  { label: 'Mantenimiento', path: '/mantenimiento', icon: Wrench, permission: 'mantenimiento.ver' },
  { label: 'Evaluaciones', path: '/evaluaciones', icon: ClipboardCheck, permission: 'evaluaciones.ver' },
  { label: 'Reportes', path: '/reportes', icon: BarChart3, permission: 'reportes.ver' },
  { label: 'Usuarios', path: '/usuarios', icon: Users, permission: 'usuarios' },
  // Nueva sección: Institución - solo para administrador
  { label: 'Institución', path: '/instituciones', icon: Settings, permission: 'configuracion', roles: ['administrador'] },
];

export function getVisibleNavItems(userRole: string): NavItem[] {
  return navItems.filter(item => {
    if (!item.permission) return true;
    const requiredRoles = MODULE_PERMISSIONS[item.permission];
    if (!requiredRoles) return true;
    const userLevel = getRoleLevel(userRole);
    return requiredRoles.some(r => userLevel >= getRoleLevel(r));
  });
}

// Configuración de rutas con roles mínimos requeridos
export const routeRoles: Record<string, 'administrador' | 'rector' | 'coordinador' | 'supervisor' | 'tecnico'> = {
  '/dashboard': 'tecnico',
  '/espacios': 'tecnico', // Ver espacios
  '/espacios/crear': 'coordinador',
  '/espacios/editar': 'coordinador',
  '/activos': 'tecnico',
  '/activos/crear': 'coordinador',
  '/activos/editar': 'coordinador',
  '/tickets': 'tecnico',
  '/tickets/crear': 'tecnico',
  '/tickets/asignar': 'coordinador',
  '/mantenimiento': 'tecnico',
  '/mantenimiento/crear': 'coordinador',
  '/mantenimiento/aprobar': 'coordinador',
  '/evaluaciones': 'tecnico',
  '/evaluaciones/crear': 'supervisor',
  '/evaluaciones/editar': 'supervisor',
  '/evaluaciones/evidencias': 'coordinador',
  '/reportes': 'coordinador',
  '/reportes/generar': 'coordinador',
  '/usuarios': 'administrador',
  '/configuracion': 'administrador',
};

export function canAccessRoute(userRole: string, path: string): boolean {
  const requiredRole = routeRoles[path];
  if (!requiredRole) return true;
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}
