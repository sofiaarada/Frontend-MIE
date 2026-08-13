import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Envuelve las rutas públicas (login, recuperar contraseña).
// Si ya hay sesión activa, redirige directo al dashboard.
export function AuthLayout() {
  const session = useAuthStore((s) => s.session);
  if (session) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
