import { Pencil, Trash2, Boxes } from 'lucide-react';
import type { Activo } from '@/types';
import { BadgeEstado } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatearMoneda } from '@/utils/format';

interface ActivosTableProps {
  activos: Activo[];
  onEditar: (activo: Activo) => void;
  onEliminar: (activo: Activo) => void;
}

export function ActivosTable({ activos, onEditar, onEliminar }: ActivosTableProps) {
  if (activos.length === 0) {
    return <EmptyState icono={Boxes} titulo="No hay activos" descripcion="Ajustá los filtros o registrá un nuevo activo." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-100 text-xs text-surface-400 dark:border-surface-800">
            <th className="px-3 py-3 font-medium">ID</th>
            <th className="px-3 py-3 font-medium">Activo</th>
            <th className="px-3 py-3 font-medium">Categoría</th>
            <th className="px-3 py-3 font-medium">Espacio</th>
            <th className="px-3 py-3 font-medium">Cant.</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="px-3 py-3 font-medium">Valor (COP)</th>
            <th className="px-3 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activos.map((a) => (
            <tr key={a.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50 dark:border-surface-800/60 dark:hover:bg-surface-800/40">
              <td className="px-3 py-3 text-xs text-surface-400">{a.codigo}</td>
              <td className="px-3 py-3">
                <p className="font-medium text-surface-800 dark:text-surface-100">{a.nombre}</p>
                <p className="text-xs text-surface-400">Resp. {a.responsable}</p>
              </td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{a.categoria}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{a.espacioNombre}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{a.cantidad}</td>
              <td className="px-3 py-3"><BadgeEstado estado={a.estado} /></td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{formatearMoneda(a.valor)}</td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEditar(a)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEliminar(a)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10">
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