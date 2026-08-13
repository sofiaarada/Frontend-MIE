import { useQuery } from '@tanstack/react-query';
import {
  Building2, Boxes, Ticket as TicketIcon, Gauge,
  AlertTriangle, Droplets, Lightbulb, ClipboardCheck,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { KpiCard } from './KpiCard';
import { formatearMoneda } from '@/utils/format';

const iconoAlerta = { ALERTA: AlertTriangle, INFO: ClipboardCheck, EXITO: ClipboardCheck, ERROR: AlertTriangle };

export function DashboardPage() {
  const { data: kpi, isLoading: cargandoKpi } = useQuery({ queryKey: ['kpis'], queryFn: dashboardService.obtenerKpis });
  const { data: evolucion = [], isLoading: cargandoEvolucion } = useQuery({ queryKey: ['evolucion-ot'], queryFn: dashboardService.obtenerEvolucionOT });
  const { data: estadoEspacios = [], isLoading: cargandoEstado } = useQuery({ queryKey: ['estado-espacios'], queryFn: dashboardService.obtenerEstadoEspacios });
  const { data: presupuesto = [], isLoading: cargandoPresupuesto } = useQuery({ queryKey: ['presupuesto'], queryFn: dashboardService.obtenerPresupuesto });
  const { data: notificaciones = [] } = useQuery({ queryKey: ['notificaciones'], queryFn: dashboardService.obtenerNotificaciones });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          titulo="Espacios totales"
          valor={kpi ? String(kpi.espaciosTotales) : ''}
          variacion={kpi ? { valor: `+${kpi.espaciosVariacion} vs. mes anterior`, positiva: true } : undefined}
          icono={Building2}
          tono="primary"
          cargando={cargandoKpi}
        />
        <KpiCard
          titulo="Activos registrados"
          valor={kpi ? kpi.activosRegistrados.toLocaleString('es-AR') : ''}
          nota={kpi ? `${kpi.activosNoRevisados} sin revisar` : undefined}
          icono={Boxes}
          tono="success"
          cargando={cargandoKpi}
        />
        <KpiCard
          titulo="OT abiertas"
          valor={kpi ? String(kpi.ticketsAbiertos) : ''}
          variacion={kpi ? { valor: `${kpi.ticketsUrgentes} urgentes`, positiva: false } : undefined}
          icono={TicketIcon}
          tono="warning"
          cargando={cargandoKpi}
        />
        <KpiCard
          titulo="Índice estado global"
          valor={kpi ? `${kpi.indiceEstadoGlobal}%` : ''}
          nota={kpi ? `Objetivo ${kpi.indiceObjetivo}%` : undefined}
          icono={Gauge}
          tono="primary"
          cargando={cargandoKpi}
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Órdenes de trabajo — evolución</CardTitle>
            <span className="text-xs text-surface-400">Últimos 6 cortes</span>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoEvolucion ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={evolucion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-100 dark:stroke-surface-800" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="completadas" stroke="#22c55e" strokeWidth={2.5} dot={false} name="Completadas" />
                  <Line type="monotone" dataKey="pendientes" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Pendientes" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de espacios</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoEstado ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={estadoEspacios} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {estadoEspacios.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  {estadoEspacios.map((e) => (
                    <div key={e.name} className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.name} · {e.value}%
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas + Presupuesto */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Alertas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-2">
            {notificaciones.slice(0, 4).map((n) => {
              const Icono = iconoAlerta[n.tipo];
              return (
                <div key={n.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800/60">
                  <Icono className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-surface-700 dark:text-surface-200">{n.titulo}</p>
                    <p className="truncate text-xs text-surface-400">{n.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Presupuesto de mantenimiento 2026</CardTitle>
            <span className="text-xs text-surface-400">Miles ARS</span>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoPresupuesto ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={presupuesto}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-100 dark:stroke-surface-800" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }}
                    formatter={(value: number) => formatearMoneda(value * 1000)}
                  />
                  <Bar dataKey="valor" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
