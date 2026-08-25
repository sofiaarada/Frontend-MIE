import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EspaciosPage } from '@/pages/espacios/EspaciosPage';
import { ActivosPage } from '@/pages/activos/ActivosPage';
import { TicketsPage } from '@/pages/tickets/TicketsPage';
import { MantenimientoPage } from '@/pages/mantenimiento/MantenimientoPage';
import { EvaluacionesPage } from '@/pages/evaluaciones/EvaluacionesPage';
import { ReportesPage } from '@/pages/reportes/ReportesPage';
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/espacios" element={<EspaciosPage />} />
              <Route path="/activos" element={<ActivosPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/mantenimiento" element={<MantenimientoPage />} />
              <Route path="/evaluaciones" element={<EvaluacionesPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}