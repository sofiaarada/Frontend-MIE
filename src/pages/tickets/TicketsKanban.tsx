import { useState } from 'react';
import type { Ticket, EstadoTicket } from '@/types';
import { TicketCard } from './TicketCard';
import { cn } from '@/utils/cn';

interface TicketsKanbanProps {
  tickets: Ticket[];
  onAbrir: (ticket: Ticket) => void;
  onMover: (ticket: Ticket, estado: EstadoTicket) => void;
}

const columnas: { estado: EstadoTicket; label: string; dot: string }[] = [
  { estado: 'PENDIENTE', label: 'Pendiente', dot: 'bg-surface-400' },
  { estado: 'EN_PROCESO', label: 'En proceso', dot: 'bg-primary-500' },
  { estado: 'FINALIZADO', label: 'Finalizado', dot: 'bg-success-500' },
];

export function TicketsKanban({ tickets, onAbrir, onMover }: TicketsKanbanProps) {
  const [sobreColumna, setSobreColumna] = useState<EstadoTicket | null>(null);
  const [idArrastrado, setIdArrastrado] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columnas.map((col) => {
        const items = tickets.filter((t) => t.estado === col.estado);
        return (
          <div
            key={col.estado}
            onDragOver={(e) => { e.preventDefault(); setSobreColumna(col.estado); }}
            onDragLeave={() => setSobreColumna(null)}
            onDrop={(e) => {
              e.preventDefault();
              setSobreColumna(null);
              const ticket = tickets.find((t) => t.id === idArrastrado);
              if (ticket && ticket.estado !== col.estado) onMover(ticket, col.estado);
            }}
            className={cn(
              'flex flex-col gap-3 rounded-2xl border border-dashed p-3 transition-colors',
              sobreColumna === col.estado
                ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-500/5'
                : 'border-surface-200 dark:border-surface-800'
            )}
          >
            <div className="flex items-center gap-2 px-1">
              <span className={cn('h-2 w-2 rounded-full', col.dot)} />
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-200">{col.label}</p>
              <span className="ml-auto text-xs text-surface-400">{items.length}</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {items.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onClick={() => onAbrir(t)}
                  onDragStart={() => setIdArrastrado(t.id)}
                />
              ))}
              {items.length === 0 && (
                <p className="rounded-xl border border-dashed border-surface-200 py-6 text-center text-xs text-surface-400 dark:border-surface-800">
                  Sin tickets
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}