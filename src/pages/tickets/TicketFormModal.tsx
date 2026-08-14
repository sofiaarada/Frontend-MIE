import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Ticket } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { mockEspacios } from '@/services/mock/mockData';

const schema = z.object({
  titulo: z.string().min(3, 'Ingresá un título.'),
  descripcion: z.string().min(3, 'Ingresá una descripción.'),
  espacioNombre: z.string().min(1, 'Seleccioná un espacio.'),
  responsable: z.string().min(2, 'Ingresá el responsable.'),
  creadoPor: z.string().min(2, 'Ingresá quién lo solicita.'),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO']),
  fechaVencimiento: z.string().min(1, 'Ingresá la fecha límite.'),
});

export type TicketFormValues = z.infer<typeof schema>;

interface TicketFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: TicketFormValues) => Promise<void>;
  ticket?: Ticket | null;
}

const valoresVacios: TicketFormValues = {
  titulo: '', descripcion: '', espacioNombre: mockEspacios[0]?.nombre ?? '',
  responsable: '', creadoPor: '', prioridad: 'MEDIA', estado: 'PENDIENTE',
  fechaVencimiento: new Date().toISOString().slice(0, 10),
};

export function TicketFormModal({ abierto, onCerrar, onGuardar, ticket }: TicketFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    if (abierto) reset(ticket ? { ...ticket } : valoresVacios);
  }, [abierto, ticket, reset]);

  const onSubmit = async (valores: TicketFormValues) => {
    setGuardando(true);
    try {
      await onGuardar(valores);
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

        <div className="grid grid-cols-2 gap-4">
          <Select label="Espacio" error={errors.espacioNombre?.message} {...register('espacioNombre')}>
            {mockEspacios.map((e) => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
          </Select>
          <Input label="Responsable" placeholder="Carlos Rivas" error={errors.responsable?.message} {...register('responsable')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Solicitado por" placeholder="María Alvarado" error={errors.creadoPor?.message} {...register('creadoPor')} />
          <Input label="Fecha límite" type="date" error={errors.fechaVencimiento?.message} {...register('fechaVencimiento')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="prioridad"
            render={({ field }) => (
              <Select label="Prioridad" value={field.value} onChange={field.onChange}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select label="Estado" value={field.value} onChange={field.onChange}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="FINALIZADO">Finalizado</option>
              </Select>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}