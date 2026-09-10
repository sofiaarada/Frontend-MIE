// Jerarquía estricta de roles: administrador > rector > coordinador > supervisor > tecnico
export const ROLE_HIERARCHY = {
  administrador: 5,
  rector: 4,
  coordinador: 3,
  supervisor: 2,
  tecnico: 1,
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

export const ROLE_LABELS: Record<Role, string> = {
  administrador: 'Administrador',
  rector: 'Rector',
  coordinador: 'Coordinador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
};

export const ROLE_DB_VALUES: Record<Role, string> = {
  administrador: 'Administrador',
  rector: 'Rector',
  coordinador: 'Coordinador',
  supervisor: 'Inspector', // En BD se llama Inspector
  tecnico: 'Técnico',
};

export function getRoleLevel(role: string): number {
  const normalized = role.toLowerCase().replace('í', 'i').replace('ó', 'o');
  return ROLE_HIERARCHY[normalized as Role] ?? 0;
}

export function hasMinimumRole(userRole: string, requiredRole: Role): boolean {
  return getRoleLevel(userRole) >= ROLE_HIERARCHY[requiredRole];
}

export function hasAnyRole(userRole: string, allowedRoles: Role[]): boolean {
  return allowedRoles.some(r => hasMinimumRole(userRole, r));
}

// Permisos por módulo
export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  // Gestión de usuarios - solo admin
  'usuarios': ['administrador'],
  
  // Espacios - Admin, Rector, Coordinador pueden gestionar; Supervisor y Técnico solo ver
  'espacios.crear': ['administrador', 'rector', 'coordinador'],
  'espacios.editar': ['administrador', 'rector', 'coordinador'],
  'espacios.eliminar': ['administrador', 'rector'],
  'espacios.ver': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  
  // Activos - Similar a espacios
  'activos.crear': ['administrador', 'rector', 'coordinador'],
  'activos.editar': ['administrador', 'rector', 'coordinador'],
  'activos.eliminar': ['administrador', 'rector'],
  'activos.ver': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  
  // Inspecciones/Evaluaciones - Inspector (Supervisor), Coordinador, Admin, Rector
  'evaluaciones.crear': ['administrador', 'rector', 'coordinador', 'supervisor'],
  'evaluaciones.editar': ['administrador', 'rector', 'coordinador', 'supervisor'],
  'evaluaciones.ver': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  'evaluaciones.evidencias.ver': ['administrador', 'rector', 'coordinador'], // Solo estos pueden VER evidencias
  
  // Mantenimiento/OT - Técnico ejecuta, Coordinador/Admin aprueba
  'mantenimiento.crear': ['administrador', 'rector', 'coordinador'],
  'mantenimiento.editar': ['administrador', 'rector', 'coordinador', 'tecnico'],
  'mantenimiento.aprobar': ['administrador', 'rector', 'coordinador'],
  'mantenimiento.ejecutar': ['administrador', 'rector', 'coordinador', 'tecnico'],
  'mantenimiento.ver': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  
  // Tickets - Todos pueden crear, Admin/Coord asignan, Técnico ejecuta
  'tickets.crear': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  'tickets.asignar': ['administrador', 'rector', 'coordinador'],
  'tickets.ejecutar': ['administrador', 'rector', 'coordinador', 'tecnico'],
  'tickets.ver': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  
  // Reportes - Admin, Rector, Coordinador
  'reportes.ver': ['administrador', 'rector', 'coordinador'],
  'reportes.generar': ['administrador', 'rector', 'coordinador'],
  'reportes.exportar': ['administrador', 'rector', 'coordinador'],
  
  // Dashboard - Todos
  'dashboard.ver': ['administrador', 'rector', 'coordinador', 'supervisor', 'tecnico'],
  
  // Configuración - Solo Admin
  'configuracion': ['administrador'],
  
  // Evidencias de mantenimiento - Admin, Rector, Coordinador, Técnico (sube), Inspector (ve)
  'evidencias_mantenimiento.subir': ['administrador', 'rector', 'coordinador', 'tecnico'],
  'evidencias_mantenimiento.ver': ['administrador', 'rector', 'coordinador', 'supervisor'],
};

export function canAccessModule(userRole: string, module: string): boolean {
  const requiredRoles = MODULE_PERMISSIONS[module];
  if (!requiredRoles) return true; // Si no está definido, permitir
  return hasAnyRole(userRole, requiredRoles);
}

// Componentes de ayuda para condicional rendering
export function RoleGate({ 
  children, 
  allowedRoles, 
  fallback = null,
  userRole 
}: { 
  children: React.ReactNode; 
  allowedRoles: Role[];
  fallback?: React.ReactNode;
  userRole: string;
}) {
  if (hasAnyRole(userRole, allowedRoles)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

export function MinimumRoleGate({ 
  children, 
  minimumRole, 
  fallback = null,
  userRole 
}: { 
  children: React.ReactNode; 
  minimumRole: Role;
  fallback?: React.ReactNode;
  userRole: string;
}) {
  if (hasMinimumRole(userRole, minimumRole)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}