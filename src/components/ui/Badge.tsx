import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import type { EstadoInfraestructura, Prioridad, EstadoTicket } from '@/types';

type BadgeTono = 'success' | 'warning' | 'danger' | 'primary' | 'neutral';

const tonos: Record<BadgeTono, string> = {
  success: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400',
  neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tono?: BadgeTono;
}

export function Badge({ tono = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tonos[tono],
        className
      )}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

const mapaEstadoInfraestructura: Record<EstadoInfraestructura, { tono: BadgeTono; label: string }> = {
  BUENO: { tono: 'success', label: 'Bueno' },
  REGULAR: { tono: 'warning', label: 'Regular' },
  DETERIORADO: { tono: 'danger', label: 'Deteriorado' },
  CRITICO: { tono: 'danger', label: 'Crítico' },
};

export function BadgeEstado({ estado }: { estado: EstadoInfraestructura }) {
  const cfg = mapaEstadoInfraestructura[estado];
  return <Badge tono={cfg.tono}>{cfg.label}</Badge>;
}

const mapaPrioridad: Record<Prioridad, { tono: BadgeTono; label: string }> = {
  BAJA: { tono: 'neutral', label: 'Baja' },
  MEDIA: { tono: 'primary', label: 'Media' },
  ALTA: { tono: 'warning', label: 'Alta' },
  URGENTE: { tono: 'danger', label: 'Urgente' },
};

export function BadgePrioridad({ prioridad }: { prioridad: Prioridad }) {
  const cfg = mapaPrioridad[prioridad];
  return <Badge tono={cfg.tono}>{cfg.label}</Badge>;
}

const mapaTicket: Record<EstadoTicket, { tono: BadgeTono; label: string }> = {
  PENDIENTE: { tono: 'neutral', label: 'Pendiente' },
  EN_PROCESO: { tono: 'primary', label: 'En proceso' },
  FINALIZADO: { tono: 'success', label: 'Finalizado' },
};

export function BadgeTicket({ estado }: { estado: EstadoTicket }) {
  const cfg = mapaTicket[estado];
  return <Badge tono={cfg.tono}>{cfg.label}</Badge>;
}
