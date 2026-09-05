import { Eye, Pencil, ClipboardCheck, MapPin, Users, Building2 } from 'lucide-react';
import type { Espacio } from '@/types';
import { Card } from '@/components/ui/Card';
import { BadgeEstado } from '@/components/ui/Badge';
import { formatearFecha } from '@/utils/format';
import { urlImagen } from '@/utils/imagen';

interface EspacioCardProps {
  espacio: Espacio;
  onVer: (espacio: Espacio) => void;
  onEditar: (espacio: Espacio) => void;
  onEvaluar: (espacio: Espacio) => void;
}

export function EspacioCard({ espacio, onVer, onEditar, onEvaluar }: EspacioCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-elevated">
      <div className="relative h-28 shrink-0 bg-surface-100 dark:bg-surface-800">
        {espacio.fotoUrl ? (
          <img src={urlImagen(espacio.fotoUrl)} alt={espacio.nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-surface-300 dark:text-surface-600">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <BadgeEstado estado={espacio.estado} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-surface-400">{espacio.codigo} · {espacio.tipo}</p>
        <h3 className="mt-0.5 truncate font-display text-sm font-semibold text-surface-900 dark:text-white">
          {espacio.nombre}
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-surface-500 dark:text-surface-400">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {espacio.piso}</span>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {espacio.capacidad} per.</span>
          <span>{espacio.areaM2} m²</span>
          <span>{espacio.ultimaInspeccion ? formatearFecha(espacio.ultimaInspeccion) : 'Sin inspección'}</span>
        </div>

        {espacio.problemasActivos > 0 && (
          <p className="mt-3 rounded-lg bg-danger-50 px-2.5 py-1.5 text-xs font-medium text-danger-600 dark:bg-danger-500/10 dark:text-danger-500">
            {espacio.problemasActivos} problema{espacio.problemasActivos > 1 ? 's' : ''} activo{espacio.problemasActivos > 1 ? 's' : ''}
          </p>
        )}

        <div className="mt-auto flex items-center gap-1 border-t border-surface-100 pt-3 dark:border-surface-800">
          <button
            onClick={() => onVer(espacio)}
            className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <Eye className="h-3.5 w-3.5" /> Ver
          </button>
          <button
            onClick={() => onEditar(espacio)}
            className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button onClick={() => onEvaluar(espacio)} className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800">
            <ClipboardCheck className="h-3.5 w-3.5" /> Evaluar
          </button>
        </div>
      </div>
    </Card>
  );
}
