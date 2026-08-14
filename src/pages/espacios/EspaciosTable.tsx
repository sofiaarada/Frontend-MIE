import { Eye, Pencil, Trash2, Building2 } from 'lucide-react';
import type { Espacio } from '@/types';
import { BadgeEstado } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatearFecha } from '@/utils/format';

interface EspaciosTableProps {
  espacios: Espacio[];
  onVer: (espacio: Espacio) => void;
  onEditar: (espacio: Espacio) => void;
  onEliminar: (espacio: Espacio) => void;
}

export function EspaciosTable({ espacios, onVer, onEditar, onEliminar }: EspaciosTableProps) {
  if (espacios.length === 0) {
    return <EmptyState titulo="No hay espacios" descripcion="Ajustá los filtros o registrá un nuevo espacio." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-100 text-xs text-surface-400 dark:border-surface-800">
            <th className="px-3 py-3 font-medium">Espacio</th>
            <th className="px-3 py-3 font-medium">Tipo</th>
            <th className="px-3 py-3 font-medium">Ubicación</th>
            <th className="px-3 py-3 font-medium">Capacidad</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="px-3 py-3 font-medium">Últ. inspección</th>
            <th className="px-3 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {espacios.map((e) => (
            <tr key={e.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50 dark:border-surface-800/60 dark:hover:bg-surface-800/40">
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800">
                    {e.fotoUrl ? (
                      <img src={e.fotoUrl} alt={e.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-4 w-4 text-surface-300 dark:text-surface-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-surface-800 dark:text-surface-100">{e.nombre}</p>
                    <p className="text-xs text-surface-400">{e.codigo}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{e.tipo}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{e.piso}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{e.capacidad} per. · {e.areaM2} m²</td>
              <td className="px-3 py-3"><BadgeEstado estado={e.estado} /></td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">
                {e.ultimaInspeccion ? formatearFecha(e.ultimaInspeccion) : '—'}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onVer(e)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEditar(e)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEliminar(e)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}