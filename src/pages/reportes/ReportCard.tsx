import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ReportCardProps {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  onGenerar: () => void;
}

export function ReportCard({ icono: Icono, titulo, descripcion, onGenerar }: ReportCardProps) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-elevated">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
        <Icono className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-display text-sm font-semibold text-surface-900 dark:text-white">{titulo}</h3>
      <p className="mt-1 flex-1 text-xs text-surface-500 dark:text-surface-400">{descripcion}</p>
      <button
        onClick={onGenerar}
        className="focus-ring mt-4 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
      >
        Generar <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </Card>
  );
}