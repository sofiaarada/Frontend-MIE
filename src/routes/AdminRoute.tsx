import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getRoleLevel } from '@/utils/permissions';

export function AdminRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session || getRoleLevel(session.usuario.rol) < getRoleLevel('administrador')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
