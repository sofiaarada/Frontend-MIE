import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EspaciosPage } from '@/pages/espacios/EspaciosPage';
import { ActivosPage } from '@/pages/activos/ActivosPage';
import { TicketsPage } from '@/pages/tickets/TicketsPage';
import { MantenimientoPage } from '@/pages/mantenimiento/MantenimientoPage';
import { ModuloEnConstruccion } from '@/pages/placeholder/ModuloEnConstruccion';
import { EvaluacionesPage } from '@/pages/evaluaciones/EvaluacionesPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
              <Route path="/reportes" element={<ModuloEnConstruccion />} />
              <Route path="/usuarios" element={<ModuloEnConstruccion />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}