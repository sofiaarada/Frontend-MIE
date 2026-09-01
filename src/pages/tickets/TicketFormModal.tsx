import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Ticket } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { prioridadesTicket, estadosTicket } from '@/constants/formOptions';
import { useActivos } from '@/hooks/useActivos';
import type { TicketInput } from '@/services/ticketsService';

const schema = z.object({
  titulo: z.string().min(3, 'Ingresá un título.'),
  descripcion: z.string().min(3, 'Ingresá una descripción.'),
  activoId: z.string().min(1, 'Seleccioná un activo.'),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO']),
});

export type TicketFormValues = z.infer<typeof schema>;

interface TicketFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: TicketFormValues) => Promise<void>;
  ticket?: Ticket | null;
}

const valoresVacios: TicketFormValues = {
  titulo: '', descripcion: '', activoId: '', prioridad: 'MEDIA', estado: 'PENDIENTE',
};

export function TicketFormModal({ abierto, onCerrar, onGuardar, ticket }: TicketFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });
  const { data: activos = [], isLoading } = useActivos();

  useEffect(() => {
    if (abierto) {
      reset(ticket ? { titulo: ticket.titulo, descripcion: ticket.descripcion, activoId: ticket.activoId ?? '', prioridad: ticket.prioridad, estado: ticket.estado } : valoresVacios);
    }
  }, [abierto, ticket, reset]);

  const onSubmit = async (valores: TicketFormValues) => {
    setGuardando(true);
    try {
      await onGuardar(valores as TicketInput);
      onCerrar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={ticket ? `Editar ${ticket.codigo}` : 'Nueva orden de trabajo'}
      descripcion="Completá los datos del ticket de mantenimiento."
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
            {ticket ? 'Guardar cambios' : 'Crear ticket'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Título" placeholder="Reparación cañería baños PB" error={errors.titulo?.message} {...register('titulo')} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">Descripción</label>
          <textarea
            rows={3}
            placeholder="Detalle del problema..."
            className="focus-ring w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            {...register('descripcion')}
          />
          {errors.descripcion && <p className="mt-1 text-xs text-danger-500">{errors.descripcion.message}</p>}
        </div>

        <Select label="Activo asociado" error={errors.activoId?.message} {...register('activoId')} disabled={isLoading}>
          <option value="">Seleccioná un activo</option>
          {activos.map((a) => <option key={a.id} value={a.id}>{a.codigo} · {a.nombre}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="prioridad"
            render={({ field }) => (
              <Select label="Prioridad" value={field.value} onChange={field.onChange}>
                {prioridadesTicket.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            )}
          />
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select label="Estado" value={field.value} onChange={field.onChange}>
                {estadosTicket.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </Select>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
