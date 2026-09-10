import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getRoleLevel } from '@/utils/permissions';

export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  }
  return <Outlet />;
}

// Rutas con jerarquía: administrador > rector > coordinador > supervisor > tecnico
export function RoleRoute({ minimumRole }: { minimumRole: 'administrador' | 'rector' | 'coordinador' | 'supervisor' | 'tecnico' }) {
  const session = useAuthStore((s) => s.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  }

  const userLevel = getRoleLevel(session.usuario.rol);
  const requiredLevel = getRoleLevel(minimumRole);

  if (userLevel < requiredLevel) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// Alias para compatibilidad
export function AdminRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session || getRoleLevel(session.usuario.rol) < getRoleLevel('administrador')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function RectorRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session || getRoleLevel(session.usuario.rol) < getRoleLevel('rector')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function CoordinadorRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session || getRoleLevel(session.usuario.rol) < getRoleLevel('coordinador')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function SupervisorRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session || getRoleLevel(session.usuario.rol) < getRoleLevel('supervisor')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function TecnicoRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session || getRoleLevel(session.usuario.rol) < getRoleLevel('tecnico')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
