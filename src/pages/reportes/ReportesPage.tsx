import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Boxes, Ticket as TicketIcon, PiggyBank } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { reportesService } from '@/services/reportesService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReportCard } from './ReportCard';
import { ReportePreviewModal } from './ReportePreviewModal';

type ReporteId = 'mensual' | 'inventario' | 'ot' | 'presupuesto' | null;

const definiciones = [
  { id: 'mensual' as const, icono: FileText, titulo: 'Reporte mensual', descripcion: 'Estado general del ciclo, indicadores clave.' },
  { id: 'inventario' as const, icono: Boxes, titulo: 'Inventario de activos', descripcion: 'Listado completo con categoría, estado y valor.' },
  { id: 'ot' as const, icono: TicketIcon, titulo: 'OT por prioridad', descripcion: 'Órdenes de trabajo agrupadas por prioridad.' },
  { id: 'presupuesto' as const, icono: PiggyBank, titulo: 'Presupuesto vs. real', descripcion: 'Comparativa mensual de gasto ejecutado.' },
];

export function ReportesPage() {
  const [reporteActivo, setReporteActivo] = useState<ReporteId>(null);

  const { data: indiceEvolucion = [], isLoading: cargandoIndice } = useQuery({
    queryKey: ['reportes-indice'],
    queryFn: reportesService.indiceEvolucion,
  });
  const { data: otPrioridad = [], isLoading: cargandoOt } = useQuery({
    queryKey: ['reportes-ot-prioridad'],
    queryFn: reportesService.otAcumuladoPorPrioridad,
  });

  const config = definiciones.find((d) => d.id === reporteActivo);

  const cargarDatos = (desde?: string, hasta?: string) => {
    switch (reporteActivo) {
      case 'mensual': return reportesService.reporteMensual();
      case 'inventario': return reportesService.inventarioActivos(desde, hasta);
      case 'ot': return reportesService.otPorPrioridad(desde, hasta);
      case 'presupuesto': return reportesService.presupuestoVsReal();
      default: return Promise.resolve({ columnas: [], filas: [] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Reportes y análisis</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Inst. Educativo San Martín · Ciclo 2026
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {definiciones.map((d) => (
          <ReportCard key={d.id} icono={d.icono} titulo={d.titulo} descripcion={d.descripcion} onGenerar={() => setReporteActivo(d.id)} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolución índice de estado de infraestructura</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoIndice ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={indiceEvolucion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-100 dark:stroke-surface-800" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="indice" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Índice" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OT por prioridad — acumulado 2026</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoOt ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={otPrioridad} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-100 dark:stroke-surface-800" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="categoria" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} />
                  <Bar dataKey="cantidad" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {config && (
        <ReportePreviewModal
          abierto={!!reporteActivo}
          onCerrar={() => setReporteActivo(null)}
          titulo={config.titulo}
          archivo={`mie-${config.id}`}
          usaFechas={config.id === 'inventario' || config.id === 'ot'}
          cargarDatos={cargarDatos}
        />
      )}
    </div>
  );
}