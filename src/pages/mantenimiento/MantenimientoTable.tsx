import { Pencil, Trash2, Wrench } from 'lucide-react';
import type { Mantenimiento } from '@/types';
import { BadgeTicket } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatearFecha, formatearMoneda } from '@/utils/format';

interface MantenimientoTableProps {
  items: Mantenimiento[];
  onEditar: (item: Mantenimiento) => void;
  onEliminar: (item: Mantenimiento) => void;
}

export function MantenimientoTable({ items, onEditar, onEliminar }: MantenimientoTableProps) {
  if (items.length === 0) {
    return <EmptyState icono={Wrench} titulo="No hay mantenimientos" descripcion="Ajustá los filtros o programá uno nuevo." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-100 text-xs text-surface-400 dark:border-surface-800">
            <th className="px-3 py-3 font-medium">Título</th>
            <th className="px-3 py-3 font-medium">Responsable</th>
            <th className="px-3 py-3 font-medium">Materiales</th>
            <th className="px-3 py-3 font-medium">Costo</th>
            <th className="px-3 py-3 font-medium">Programado</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="px-3 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50 dark:border-surface-800/60 dark:hover:bg-surface-800/40">
              <td className="px-3 py-3 font-medium text-surface-800 dark:text-surface-100">{m.titulo}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{m.responsable}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">
                {m.materiales.length > 0 ? m.materiales.join(', ') : '—'}
              </td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{formatearMoneda(m.costo)}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{formatearFecha(m.fechaProgramada)}</td>
              <td className="px-3 py-3"><BadgeTicket estado={m.estado} /></td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEditar(m)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEliminar(m)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10">
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