import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AdminRoute() {
  const role = useAuthStore((s) => s.session?.usuario.rol);
  return role === 'Administrador' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
