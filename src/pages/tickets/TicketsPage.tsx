import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Ticket, EstadoTicket } from '@/types';
import { ticketsService } from '@/services/ticketsService';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/utils/cn';
import { TicketsKanban } from './TicketsKanban';
import { TicketsTable } from './TicketsTable';
import { TicketFormModal, type TicketFormValues } from './TicketFormModal';

type FiltroPrioridad = 'TODAS' | Ticket['prioridad'];

export function TicketsPage() {
  const queryClient = useQueryClient();
  const [vista, setVista] = useState<'kanban' | 'tabla'>('kanban');
  const [busqueda, setBusqueda] = useState('');
  const [prioridad, setPrioridad] = useState<FiltroPrioridad>('TODAS');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [ticketAEliminar, setTicketAEliminar] = useState<Ticket | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', { busqueda, prioridad }],
    queryFn: () => ticketsService.listar({ busqueda, prioridad }),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['tickets'] });

  const abrirNuevo = () => { setTicketSeleccionado(null); setModalAbierto(true); };
  const abrirEditar = (t: Ticket) => { setTicketSeleccionado(t); setModalAbierto(true); };

  const mover = async (ticket: Ticket, estado: EstadoTicket) => {
    try {
      await ticketsService.actualizarEstado(ticket.id, estado);
      invalidar();
      toast.success(`"${ticket.titulo}" movido a ${estado === 'EN_PROCESO' ? 'En proceso' : estado === 'FINALIZADO' ? 'Finalizado' : 'Pendiente'}.`);
    } catch {
      toast.error('No se pudo mover el ticket.');
    }
  };

  const guardar = async (valores: TicketFormValues) => {
    try {
      if (ticketSeleccionado) {
        await ticketsService.actualizar(ticketSeleccionado.id, valores);
        toast.success('Ticket actualizado.');
      } else {
        await ticketsService.crear(valores);
        toast.success('Ticket creado.');
      }
      invalidar();
    } catch {
      toast.error('No se pudo guardar el ticket.');
    }
  };

  const confirmarEliminar = async () => {
    if (!ticketAEliminar) return;
    setEliminando(true);
    try {
      await ticketsService.eliminar(ticketAEliminar.id);
      toast.success('Ticket eliminado.');
      invalidar();
      setTicketAEliminar(null);
    } catch {
      toast.error('No se pudo eliminar el ticket.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Órdenes de trabajo</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
        <Button icono={<Plus className="h-4 w-4" />} onClick={abrirNuevo}>
          Nueva OT
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-xs flex-1">
            <Input
              placeholder="Buscar ticket, código..."
              icono={<Search className="h-4 w-4" />}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select value={prioridad} onChange={(e) => setPrioridad(e.target.value as FiltroPrioridad)}>
              <option value="TODAS">Toda prioridad</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </Select>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 self-start rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
          <button
            onClick={() => setVista('kanban')}
            className={cn('focus-ring flex h-8 w-8 items-center justify-center rounded-md', vista === 'kanban' ? 'bg-white shadow-soft dark:bg-surface-950' : 'text-surface-400')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVista('tabla')}
            className={cn('focus-ring flex h-8 w-8 items-center justify-center rounded-md', vista === 'tabla' ? 'bg-white shadow-soft dark:bg-surface-950' : 'text-surface-400')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      ) : vista === 'kanban' ? (
        <TicketsKanban tickets={tickets} onAbrir={abrirEditar} onMover={mover} />
      ) : (
        <Card className="p-2">
          <TicketsTable tickets={tickets} onEditar={abrirEditar} onEliminar={setTicketAEliminar} />
        </Card>
      )}

      <TicketFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        ticket={ticketSeleccionado}
      />

      <ConfirmDialog
        abierto={!!ticketAEliminar}
        onCerrar={() => setTicketAEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar ticket"
        descripcion={`¿Seguro que querés eliminar "${ticketAEliminar?.titulo}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
      />
    </div>
  );
}