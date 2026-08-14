import { Pencil, Trash2, Ticket as TicketIcon } from 'lucide-react';
import type { Ticket } from '@/types';
import { BadgePrioridad, BadgeTicket } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatearFecha } from '@/utils/format';

interface TicketsTableProps {
  tickets: Ticket[];
  onEditar: (ticket: Ticket) => void;
  onEliminar: (ticket: Ticket) => void;
}

export function TicketsTable({ tickets, onEditar, onEliminar }: TicketsTableProps) {
  if (tickets.length === 0) {
    return <EmptyState icono={TicketIcon} titulo="No hay tickets" descripcion="Ajustá los filtros o creá una nueva OT." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-100 text-xs text-surface-400 dark:border-surface-800">
            <th className="px-3 py-3 font-medium">Código</th>
            <th className="px-3 py-3 font-medium">Título</th>
            <th className="px-3 py-3 font-medium">Espacio</th>
            <th className="px-3 py-3 font-medium">Responsable</th>
            <th className="px-3 py-3 font-medium">Prioridad</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="px-3 py-3 font-medium">Vence</th>
            <th className="px-3 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50 dark:border-surface-800/60 dark:hover:bg-surface-800/40">
              <td className="px-3 py-3 text-xs text-surface-400">{t.codigo}</td>
              <td className="px-3 py-3 font-medium text-surface-800 dark:text-surface-100">{t.titulo}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{t.espacioNombre}</td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{t.responsable}</td>
              <td className="px-3 py-3"><BadgePrioridad prioridad={t.prioridad} /></td>
              <td className="px-3 py-3"><BadgeTicket estado={t.estado} /></td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{formatearFecha(t.fechaVencimiento)}</td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEditar(t)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEliminar(t)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10">
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