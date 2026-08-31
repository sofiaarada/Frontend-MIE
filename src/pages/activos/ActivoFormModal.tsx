import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Activo } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { categoriasActivo } from '@/constants/formOptions';
import { useEspacios } from '@/hooks/useEspacios';

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá un nombre.'),
  codigo: z.string().min(1, 'Ingresá un código.'),
  categoria: z.string().min(1, 'Seleccioná una categoría.'),
  espacioId: z.string().min(1, 'Seleccioná un espacio.'),
  cantidad: z.coerce.number().min(1, 'La cantidad debe ser al menos 1.'),
  responsable: z.string().min(2, 'Ingresá el responsable.'),
  valor: z.coerce.number().min(0, 'El valor no puede ser negativo.'),
  estado: z.enum(['BUENO', 'REGULAR', 'DETERIORADO', 'CRITICO']),
  fechaAdquisicion: z.string().min(1, 'Ingresá la fecha de adquisición.'),
});

export type ActivoFormValues = z.infer<typeof schema>;

interface ActivoFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: ActivoFormValues) => Promise<void>;
  activo?: Activo | null;
}

const valoresVacios: ActivoFormValues = {
  nombre: '', codigo: '', categoria: '', espacioId: '',
  cantidad: 1, responsable: '', valor: 0, estado: 'BUENO',
  fechaAdquisicion: new Date().toISOString().slice(0, 10),
};

export function ActivoFormModal({ abierto, onCerrar, onGuardar, activo }: ActivoFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ActivoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });
  const { data: espacios = [], isLoading } = useEspacios();

  useEffect(() => {
    if (abierto) reset(activo ? { ...activo } : valoresVacios);
  }, [abierto, activo, reset]);

  const onSubmit = async (valores: ActivoFormValues) => {
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
      titulo={activo ? 'Editar activo' : 'Registrar activo'}
      descripcion="Completá la información del activo del inventario."
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
            {activo ? 'Guardar cambios' : 'Registrar activo'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre" placeholder="Proyector Epson EB" error={errors.nombre?.message} {...register('nombre')} />
          <Input label="Código" placeholder="TEC-0071" error={errors.codigo?.message} {...register('codigo')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Categoría" error={errors.categoria?.message} {...register('categoria')}>
            <option value="">Seleccioná una categoría</option>
            {categoriasActivo.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Espacio" error={errors.espacioId?.message} {...register('espacioId')} disabled={isLoading}>
            <option value="">Seleccioná un espacio</option>
            {espacios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Cantidad" type="number" min={1} error={errors.cantidad?.message} {...register('cantidad')} />
          <Input label="Responsable" placeholder="Patricia Núñez" error={errors.responsable?.message} {...register('responsable')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Valor (ARS)" type="number" min={0} error={errors.valor?.message} {...register('valor')} />
          <Input label="Fecha de adquisición" type="date" error={errors.fechaAdquisicion?.message} {...register('fechaAdquisicion')} />
        </div>

        <Controller
          control={control}
          name="estado"
          render={({ field }) => (
            <Select label="Estado" value={field.value} onChange={field.onChange}>
              <option value="BUENO">Bueno</option>
              <option value="REGULAR">Regular</option>
              <option value="DETERIORADO">Deteriorado</option>
              <option value="CRITICO">Crítico</option>
            </Select>
          )}
        />
      </div>
    </Modal>
  );
}