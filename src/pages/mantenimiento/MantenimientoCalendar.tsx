import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import type { Mantenimiento } from '@/types';
import { Card } from '@/components/ui/Card';
import { BadgeTicket } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatearMoneda } from '@/utils/format';
import { cn } from '@/utils/cn';

interface MantenimientoCalendarProps {
  items: Mantenimiento[];
  onAbrir: (item: Mantenimiento) => void;
}

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const clave = (d: Date) => d.toISOString().slice(0, 10);

export function MantenimientoCalendar({ items, onAbrir }: MantenimientoCalendarProps) {
  const [mesActivo, setMesActivo] = useState(() => {
    const primero = items[0]?.fechaProgramada;
    return primero ? new Date(primero + 'T00:00:00') : new Date();
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  const itemsPorDia = useMemo(() => {
    const mapa = new Map<string, Mantenimiento[]>();
    items.forEach((item) => {
      const lista = mapa.get(item.fechaProgramada) ?? [];
      lista.push(item);
      mapa.set(item.fechaProgramada, lista);
    });
    return mapa;
  }, [items]);

  const celdas = useMemo(() => {
    const anio = mesActivo.getFullYear();
    const mes = mesActivo.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const offset = (primerDia.getDay() + 6) % 7; // lunes = 0

    const dias: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(anio, mes, d));
    while (dias.length % 7 !== 0) dias.push(null);
    return dias;
  }, [mesActivo]);

  const hoy = clave(new Date());
  const itemsDelDia = diaSeleccionado ? itemsPorDia.get(diaSeleccionado) ?? [] : [];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="p-4 xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-surface-800 dark:text-surface-100">
            {meses[mesActivo.getMonth()]} {mesActivo.getFullYear()}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMesActivo(new Date(mesActivo.getFullYear(), mesActivo.getMonth() - 1, 1))}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMesActivo(new Date(mesActivo.getFullYear(), mesActivo.getMonth() + 1, 1))}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-surface-400">
          {diasSemana.map((d) => <div key={d} className="py-1.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((dia, i) => {
            if (!dia) return <div key={i} />;
            const k = clave(dia);
            const eventos = itemsPorDia.get(k) ?? [];
            return (
              <button
                key={k}
                onClick={() => setDiaSeleccionado(eventos.length ? k : null)}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs transition-colors',
                  k === hoy && 'ring-1 ring-primary-400',
                  diaSeleccionado === k ? 'bg-primary-600 text-white' : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800',
                  eventos.length === 0 && 'cursor-default text-surface-300 hover:bg-transparent dark:text-surface-700 dark:hover:bg-transparent'
                )}
              >
                {dia.getDate()}
                {eventos.length > 0 && (
                  <span className={cn('h-1.5 w-1.5 rounded-full', diaSeleccionado === k ? 'bg-white' : 'bg-primary-500')} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 font-display text-sm font-semibold text-surface-800 dark:text-surface-100">
          {diaSeleccionado ? `Programado para el ${diaSeleccionado.split('-').reverse().join('/')}` : 'Seleccioná un día'}
        </p>
        {itemsDelDia.length === 0 ? (
          <EmptyState icono={Wrench} titulo="Sin mantenimientos" descripcion="Elegí un día marcado en el calendario." />
        ) : (
          <div className="space-y-2.5">
            {itemsDelDia.map((item) => (
              <button
                key={item.id}
                onClick={() => onAbrir(item)}
                className="focus-ring w-full rounded-xl border border-surface-100 p-3 text-left hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{item.titulo}</p>
                  <BadgeTicket estado={item.estado} />
                </div>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  {item.responsable} · {formatearMoneda(item.costo)}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}