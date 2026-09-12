import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  Building2, Boxes, Ticket as TicketIcon, Gauge,
  AlertTriangle, ClipboardCheck, Bell, Info, XCircle,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
  Legend, ReferenceLine
} from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { KpiCard } from './KpiCard';
import { formatearMoneda } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface AlertaExtendida {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'Info' | 'Advertencia' | 'Critico';
  leido: boolean;
  fecha: string;
}

const iconoAlerta: Record<string, React.ComponentType<{ className?: string }>> = {
  Info: ClipboardCheck,
  Advertencia: AlertTriangle,
  Critico: AlertTriangle,
};

const colorAlerta: Record<string, string> = {
  Info: 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10',
  Advertencia: 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10',
  Critico: 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10',
};

const colorIconoAlerta: Record<string, string> = {
  Info: 'text-blue-500',
  Advertencia: 'text-amber-500',
  Critico: 'text-red-500',
};

const badgeAlerta: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  Info: ({ children }) => <Badge tono="primary">{children}</Badge>,
  Advertencia: ({ children }) => <Badge tono="warning">{children}</Badge>,
  Critico: ({ children }) => <Badge tono="danger">{children}</Badge>,
};

export function DashboardPage() {
  const { data: kpi, isLoading: cargandoKpi } = useQuery({ queryKey: ['kpis'], queryFn: dashboardService.obtenerKpis });
  const { data: evolucion = [], isLoading: cargandoEvolucion } = useQuery({ queryKey: ['evolucion-ot'], queryFn: dashboardService.obtenerEvolucionOT });
  const { data: estadoEspaciosRaw = [], isLoading: cargandoEstado } = useQuery({ queryKey: ['estado-espacios'], queryFn: dashboardService.obtenerEstadoEspacios });
  const { data: presupuesto = [], isLoading: cargandoPresupuesto } = useQuery({ queryKey: ['presupuesto'], queryFn: dashboardService.obtenerPresupuesto });
  const { data: notificacionesRaw = [] } = useQuery({ queryKey: ['notificaciones'], queryFn: dashboardService.obtenerNotificaciones });
  
  const [notificaciones, setNotificaciones] = useState<AlertaExtendida[]>([]);
  const [descartadas, setDescartadas] = useState<Set<string>>(new Set());

  // Procesar notificaciones y filtrar descartadas
  useEffect(() => {
    const procesadas: AlertaExtendida[] = notificacionesRaw.map(n => ({
      ...n,
      tipo: (['Info', 'Advertencia', 'Critico'].includes(n.tipo) ? n.tipo : 'Info') as 'Info' | 'Advertencia' | 'Critico',
    }));
    setNotificaciones(procesadas.filter(n => !descartadas.has(n.id)));
  }, [notificacionesRaw, descartadas]);

  const descartarAlerta = (id: string) => {
    setDescartadas(prev => new Set([...prev, id]));
  };

  // Calcular porcentajes reales para estado de espacios
  const totalEspacios = estadoEspaciosRaw.reduce((sum, e) => sum + e.value, 0);
  const estadoEspacios = totalEspacios > 0 
    ? estadoEspaciosRaw.map(e => ({ ...e, value: Math.round((e.value / totalEspacios) * 100) }))
    : estadoEspaciosRaw;

  // Calcular tendencia para OT
  const ultimaEvolucion = evolucion[evolucion.length - 1];
  const penultimaEvolucion = evolucion[evolucion.length - 2];
  const tendenciaCompletadas = penultimaEvolucion 
    ? ultimaEvolucion.completadas - penultimaEvolucion.completadas 
    : 0;

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
        {/* Órdenes de trabajo — evolución */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Órdenes de trabajo — Evolución</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-400">Últimos 6 cortes</span>
              {tendenciaCompletadas !== 0 && (
                <Badge tono={tendenciaCompletadas > 0 ? 'success' : 'danger'} className="text-xs">
                  {tendenciaCompletadas > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(tendenciaCompletadas)} vs mes anterior
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoEvolucion ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={evolucion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-100 dark:stroke-surface-800" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} 
                    formatter={(value: number) => [value, 'OTs']}
                    labelFormatter={(label: string) => `Mes: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completadas" 
                    stroke="#22c55e" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    name="Completadas" 
                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pendientes" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    name="Pendientes" 
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Estado de espacios - Pie chart con porcentajes reales sobre 100% */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de espacios</CardTitle>
            <span className="text-xs text-surface-400">Distribución porcentual (total = 100%)</span>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoEstado ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie 
                      data={estadoEspacios} 
                      dataKey="value" 
                      nameKey="name" 
                      innerRadius={50} 
                      outerRadius={75} 
                      paddingAngle={3}
                      label={({ name, value, percent }) => `${name}: ${value}% (${(percent * 100).toFixed(1)}%)`}
                      labelLine={false}
                    >
                      {estadoEspacios.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} 
                      formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {estadoEspacios.map((e) => (
                    <div key={e.name} className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="font-medium text-surface-700 dark:text-surface-200">{e.name}</span>
                      <span className="font-semibold text-surface-900 dark:text-white">{e.value}%</span>
                    </div>
                  ))}
                </div>
                {totalEspacios > 0 && (
                  <p className="mt-2 text-xs text-surface-400 text-center">
                    Total espacios: <span className="font-medium text-surface-700 dark:text-surface-200">{totalEspacios}</span>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas + Presupuesto */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Alertas recientes con 3 tipos visuales y descartar */}
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alertas recientes</CardTitle>
            {notificaciones.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setDescartadas(new Set(notificaciones.map(n => n.id)))}>
                <XCircle className="h-3.5 w-3.5 mr-1" /> Limpiar todas
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2 pt-2 max-h-96 overflow-y-auto">
            {notificaciones.slice(0, 5).map((n) => {
              const Icono = iconoAlerta[n.tipo] ?? ClipboardCheck;
              const bgColor = colorAlerta[n.tipo];
              const iconColor = colorIconoAlerta[n.tipo];
              const BadgeComp = badgeAlerta[n.tipo];
              
              return (
                <div 
                  key={n.id} 
                  className={cn(
                    'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all',
                    bgColor,
                    n.leido ? 'opacity-60' : ''
                  )}
                >
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconColor.replace('text-', 'bg-').replace('500', '100'))}>
                    <Icono className={cn('h-4 w-4', iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-sm font-medium', n.leido ? 'text-surface-600 dark:text-surface-300' : 'text-surface-900 dark:text-white')}>
                        {n.titulo}
                      </p>
                      <BadgeComp>{n.tipo}</BadgeComp>
                    </div>
                    <p className={cn('truncate text-xs mt-0.5', n.leido ? 'text-surface-400' : 'text-surface-500 dark:text-surface-400')}>
                      {n.descripcion}
                    </p>
                    <p className="text-[10px] text-surface-400 mt-1">{new Date(n.fecha).toLocaleString('es-AR')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => descartarAlerta(n.id)}
                    className="focus-ring -mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded text-surface-300 hover:text-surface-500 hover:bg-surface-200 dark:text-surface-500 dark:hover:text-surface-300 dark:hover:bg-surface-700"
                    aria-label="Descartar alerta"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {notificaciones.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-surface-400">
                <Bell className="h-8 w-8 opacity-50" />
                <p className="text-sm">No hay alertas recientes</p>
                <span className="text-xs">Las alertas aparecen automáticamente</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Presupuesto de mantenimiento - Bar chart mejorado */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Presupuesto de mantenimiento 2026</CardTitle>
            <span className="text-xs text-surface-400">Miles COP</span>
          </CardHeader>
          <CardContent className="pt-4">
            {cargandoPresupuesto ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={presupuesto} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-surface-100 dark:stroke-surface-800" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} 
                    tickFormatter={(value) => formatearMoneda(value * 1000).replace('$', '')}
                  />
                  <YAxis dataKey="mes" type="category" width={60} tick={{ fontSize: 12, fill: 'var(--color-surface-400)' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 12 }} 
                    formatter={(value: number) => [formatearMoneda(value * 1000), 'Mes']}
                    labelFormatter={(label: string) => `Mes: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="valor" 
                    fill="#2563eb" 
                    radius={[0, 6, 6, 0]} 
                    name="Presupuesto"
                    label={{ position: 'insideRight', offset: -10, formatter: (v: number) => v > 0 ? `${v}k` : '', fontSize: 11, fill: 'white', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={presupuesto.reduce((sum, p) => sum + p.valor, 0) / presupuesto.length} 
                    stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'inside', value: 'Promedio', fill: '#ef4444', fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
