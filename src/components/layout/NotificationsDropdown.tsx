import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { cn } from '@/utils/cn';

const iconoPorTipo = { ALERTA: AlertTriangle, INFO: Info, EXITO: CheckCircle2, ERROR: AlertTriangle };
const colorPorTipo = {
  ALERTA: 'text-warning-500 bg-warning-50 dark:bg-warning-500/10',
  INFO: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10',
  EXITO: 'text-success-500 bg-success-50 dark:bg-success-500/10',
  ERROR: 'text-danger-500 bg-danger-50 dark:bg-danger-500/10',
};

export function NotificationsDropdown() {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notificaciones = [] } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: dashboardService.obtenerNotificaciones,
  });
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((a) => !a)}
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
      >
        <Bell className="h-[18px] w-[18px]" />
        {noLeidas > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-surface-900" />
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-elevated dark:border-surface-800 dark:bg-surface-900"
          >
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 dark:border-surface-800">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">Notificaciones</p>
              {noLeidas > 0 && <span className="text-xs text-primary-600">{noLeidas} nuevas</span>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificaciones.map((n) => {
                const Icono = iconoPorTipo[n.tipo];
                return (
                  <div key={n.id} className={cn('flex gap-3 px-4 py-3', !n.leida && 'bg-primary-50/40 dark:bg-primary-500/5')}>
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', colorPorTipo[n.tipo])}>
                      <Icono className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{n.titulo}</p>
                      <p className="truncate text-xs text-surface-500 dark:text-surface-400">{n.descripcion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
