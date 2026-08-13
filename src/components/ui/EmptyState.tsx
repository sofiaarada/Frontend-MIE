import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icono?: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EmptyState({ icono: Icono = Inbox, titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-200 py-16 text-center dark:border-surface-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-400 dark:bg-surface-800">
        <Icono className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium text-surface-700 dark:text-surface-200">{titulo}</p>
        {descripcion && <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}
