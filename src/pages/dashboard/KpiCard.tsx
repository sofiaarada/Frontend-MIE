import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

interface KpiCardProps {
  titulo: string;
  valor: string;
  variacion?: { valor: string; positiva: boolean };
  nota?: string;
  icono: LucideIcon;
  tono?: 'primary' | 'success' | 'warning' | 'danger';
  cargando?: boolean;
}

const tonos = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  success: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
};

export function KpiCard({ titulo, valor, variacion, nota, icono: Icono, tono = 'primary', cargando }: KpiCardProps) {
  if (cargando) {
    return (
      <Card className="p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-20" />
        <Skeleton className="mt-3 h-3 w-28" />
      </Card>
    );
  }

  return (
    <Card className="p-5 transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{titulo}</p>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tonos[tono])}>
          <Icono className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-surface-900 dark:text-white">{valor}</p>
      {(variacion || nota) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {variacion && (
            <span className={cn('flex items-center gap-0.5 font-medium', variacion.positiva ? 'text-success-600' : 'text-danger-500')}>
              {variacion.positiva ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {variacion.valor}
            </span>
          )}
          {nota && <span className="text-surface-400">{nota}</span>}
        </div>
      )}
    </Card>
  );
}
