import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Ticket } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ComboboxBusqueda, type ComboboxOpcion } from '@/components/ui/ComboboxBusqueda';
import { Button } from '@/components/ui/Button';
import { prioridadesTicket, estadosTicket } from '@/constants/formOptions';
import { useActivos } from '@/hooks/useActivos';
import type { TicketInput } from '@/services/ticketsService';

const schema = z.object({
  titulo: z.string().min(3, 'Ingresá un título.'),
  descripcion: z.string().min(3, 'Ingresá una descripción.'),
  activoId: z.string().min(1, 'Seleccioná un activo.'),
  responsableId: z.string().optional(),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO']),
  fechaVencimiento: z.string().optional().refine(val => !val || val >= '2026-01-01', 'La fecha debe ser 2026 o posterior.'),
});

export type TicketFormValues = z.infer<typeof schema>;

export interface ResponsableOpcion { id: string; nombre: string; }

interface TicketFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: TicketFormValues) => Promise<void>;
  ticket?: Ticket | null;
  responsables: ResponsableOpcion[];
}

const valoresVacios: TicketFormValues = {
  titulo: '', descripcion: '', activoId: '', responsableId: '', prioridad: 'MEDIA', estado: 'PENDIENTE', fechaVencimiento: '',
};

export function TicketFormModal({ abierto, onCerrar, onGuardar, ticket, responsables }: TicketFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });
  const { data: activos = [], isLoading } = useActivos();

  useEffect(() => {
    if (abierto) {
      reset(ticket ? { titulo: ticket.titulo, descripcion: ticket.descripcion, activoId: ticket.activoId ?? '', responsableId: ticket.responsableId ?? '', prioridad: ticket.prioridad, estado: ticket.estado, fechaVencimiento: ticket.fechaVencimiento || '' } : valoresVacios);
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

        <Controller
          control={control}
          name="activoId"
          render={({ field }) => (
            <ComboboxBusqueda
              label="Activo asociado"
              placeholder="Buscar activo…"
              error={errors.activoId?.message}
              opciones={activos.map((a): ComboboxOpcion => ({ id: a.id, etiqueta: `${a.codigo} · ${a.nombre}`, detalle: a.espacioNombre }))}
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
              vacioMensaje={isLoading ? 'Cargando activos…' : 'No hay activos disponibles.'}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="responsableId"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Responsable"
                placeholder="Buscar responsable…"
                error={errors.responsableId?.message}
                opciones={responsables.map((r): ComboboxOpcion => ({ id: r.id, etiqueta: r.nombre }))}
                value={field.value ?? ''}
                onChange={field.onChange}
                vacioMensaje="No hay responsables disponibles."
              />
            )}
          />
          <Input label="Vence" type="date" error={errors.fechaVencimiento?.message} {...register('fechaVencimiento')} />
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
