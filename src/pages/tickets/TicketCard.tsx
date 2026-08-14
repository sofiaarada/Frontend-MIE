import { MapPin, User, Calendar } from 'lucide-react';
import type { DragEvent } from 'react';
import type { Ticket } from '@/types';
import { Card } from '@/components/ui/Card';
import { BadgePrioridad } from '@/components/ui/Badge';
import { formatearFecha } from '@/utils/format';
import { cn } from '@/utils/cn';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  onDragStart: (e: DragEvent) => void;
}

export function TicketCard({ ticket, onClick, onDragStart }: TicketCardProps) {
  const vencido = new Date(ticket.fechaVencimiento) < new Date() && ticket.estado !== 'FINALIZADO';

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-grab space-y-2.5 p-3.5 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-surface-400">{ticket.codigo}</p>
        <BadgePrioridad prioridad={ticket.prioridad} />
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-snug text-surface-800 dark:text-surface-100">
        {ticket.titulo}
      </p>
      <div className="space-y-1 text-xs text-surface-500 dark:text-surface-400">
        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> {ticket.espacioNombre}</p>
        <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 shrink-0" /> {ticket.responsable}</p>
        <p className={cn('flex items-center gap-1.5', vencido && 'font-medium text-danger-500')}>
          <Calendar className="h-3.5 w-3.5 shrink-0" /> {formatearFecha(ticket.fechaVencimiento)}
        </p>
      </div>
    </Card>
  );
}