import { Eye, Wrench } from 'lucide-react';
import type { Inspeccion } from '@/types';
import { Card } from '@/components/ui/Card';
import { BadgeEstado } from '@/components/ui/Badge';
import { formatearFecha } from '@/utils/format';
import { cn } from '@/utils/cn';

interface EvaluacionCardProps {
  inspeccion: Inspeccion;
  onVer: (inspeccion: Inspeccion) => void;
}

const colorBarra = {
  BUENO: 'bg-success-500',
  REGULAR: 'bg-warning-500',
  DETERIORADO: 'bg-orange-500',
  CRITICO: 'bg-danger-500',
} as const;

export function EvaluacionCard({ inspeccion, onVer }: EvaluacionCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold text-surface-900 dark:text-white">{inspeccion.espacioNombre}</h3>
          <p className="mt-0.5 text-xs text-surface-400">{inspeccion.inspector} · {formatearFecha(inspeccion.fecha)}</p>
        </div>
        <BadgeEstado estado={inspeccion.estado} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
        <span>Puntaje global</span>
        <span className="font-semibold text-surface-800 dark:text-surface-100">{inspeccion.puntajeGlobal}/100</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
        <div
          className={cn('h-full rounded-full transition-all', colorBarra[inspeccion.estado])}
          style={{ width: `${inspeccion.puntajeGlobal}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-50 px-3 py-2 text-center dark:bg-surface-800/60">
          <p className="text-base font-semibold text-surface-800 dark:text-surface-100">{inspeccion.itemsBuenos}</p>
          <p className="text-[11px] text-surface-400">Ítems buenos</p>
        </div>
        <div className="rounded-lg bg-surface-50 px-3 py-2 text-center dark:bg-surface-800/60">
          <p className="text-base font-semibold text-surface-800 dark:text-surface-100">{inspeccion.observaciones}</p>
          <p className="text-[11px] text-surface-400">Observaciones</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-surface-100 pt-3 dark:border-surface-800">
        <button
          onClick={() => onVer(inspeccion)}
          className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
        >
          <Eye className="h-3.5 w-3.5" /> Ver detalle
        </button>
        <button className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800">
          <Wrench className="h-3.5 w-3.5" /> Generar OT
        </button>
      </div>
    </Card>
  );
}