import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Mantenimiento } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useActivos } from '@/hooks/useActivos';

const schema = z.object({
  titulo: z.string().min(3, 'Ingresá un título.'),
  activoId: z.string().min(1, 'Seleccioná un activo.'),
  fechaProgramada: z.string().min(1, 'Ingresá la fecha programada.'),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO']),
  responsableId: z.string().optional(),
  materiales: z.string().optional(),
  costo: z.coerce.number().min(0, 'El costo no puede ser negativo.').optional(),
});

export type MantenimientoFormValues = z.infer<typeof schema>;

export interface ResponsableOpcion { id: string; nombre: string; }

interface MantenimientoFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: MantenimientoFormValues) => Promise<void>;
  item?: Mantenimiento | null;
  responsables: ResponsableOpcion[];
}

const valoresVacios: MantenimientoFormValues = {
  titulo: '', activoId: '',
  fechaProgramada: new Date().toISOString().slice(0, 10), estado: 'PENDIENTE',
  responsableId: '', materiales: '', costo: 0,
};

export function MantenimientoFormModal({ abierto, onCerrar, onGuardar, item, responsables }: MantenimientoFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<MantenimientoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });
  const { data: activos = [], isLoading } = useActivos();

  useEffect(() => {
    if (abierto) {
      reset(item
        ? { titulo: item.titulo, activoId: item.activoId ?? '', fechaProgramada: item.fechaProgramada, estado: item.estado, responsableId: '', materiales: item.materiales.join(', '), costo: item.costo }
        : valoresVacios);
    }
  }, [abierto, item, reset]);

  const onSubmit = async (valores: MantenimientoFormValues) => {
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
      titulo={item ? 'Editar mantenimiento' : 'Programar mantenimiento'}
      descripcion="Completá los datos del trabajo de mantenimiento."
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
            {item ? 'Guardar cambios' : 'Programar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Título" placeholder="Mantenimiento preventivo climatización" error={errors.titulo?.message} {...register('titulo')} />

        <Select label="Activo a intervenir" error={errors.activoId?.message} {...register('activoId')} disabled={isLoading}>
          <option value="">Seleccioná un activo</option>
          {activos.map((a) => <option key={a.id} value={a.id}>{a.codigo} · {a.nombre}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Responsable" error={errors.responsableId?.message} {...register('responsableId')}>
            <option value="">Sin asignar</option>
            {responsables.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Select>
          <Input label="Costo estimado (COP)" type="number" min={0} error={errors.costo?.message} {...register('costo')} />
        </div>

        <Input label="Materiales" placeholder="Pintura, brocas, sellador…" error={errors.materiales?.message} {...register('materiales')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha programada" type="date" error={errors.fechaProgramada?.message} {...register('fechaProgramada')} />
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select label="Estado" value={field.value} onChange={field.onChange}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
              </Select>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
