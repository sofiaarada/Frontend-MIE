import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import type { Mantenimiento } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  titulo: z.string().min(3, 'Ingresá un título.'),
  responsable: z.string().min(2, 'Ingresá el responsable.'),
  materiales: z.array(z.string()),
  costo: z.coerce.number().min(0, 'El costo no puede ser negativo.'),
  fechaProgramada: z.string().min(1, 'Ingresá la fecha programada.'),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO']),
});

export type MantenimientoFormValues = z.infer<typeof schema>;

interface MantenimientoFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: MantenimientoFormValues) => Promise<void>;
  item?: Mantenimiento | null;
}

const valoresVacios: MantenimientoFormValues = {
  titulo: '', responsable: '', materiales: [], costo: 0,
  fechaProgramada: new Date().toISOString().slice(0, 10), estado: 'PENDIENTE',
};

export function MantenimientoFormModal({ abierto, onCerrar, onGuardar, item }: MantenimientoFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [materialNuevo, setMaterialNuevo] = useState('');

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<MantenimientoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  const materiales = watch('materiales');

  useEffect(() => {
    if (abierto) reset(item ? { ...item } : valoresVacios);
  }, [abierto, item, reset]);

  const agregarMaterial = () => {
    const valor = materialNuevo.trim();
    if (!valor) return;
    setValue('materiales', [...materiales, valor]);
    setMaterialNuevo('');
  };

  const quitarMaterial = (i: number) => {
    setValue('materiales', materiales.filter((_, idx) => idx !== i));
  };

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

        <div className="grid grid-cols-2 gap-4">
          <Input label="Responsable" placeholder="Patricia Núñez" error={errors.responsable?.message} {...register('responsable')} />
          <Input label="Costo estimado (COP)" type="number" min={0} error={errors.costo?.message} {...register('costo')} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">Materiales</label>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Filtros de aire (x4)"
              value={materialNuevo}
              onChange={(e) => setMaterialNuevo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarMaterial(); } }}
            />
            <Button type="button" variant="outline" size="icon" onClick={agregarMaterial}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {materiales.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {materiales.map((mat, i) => (
                <span
                  key={`${mat}-${i}`}
                  className="flex items-center gap-1.5 rounded-full bg-surface-100 py-1 pl-2.5 pr-1.5 text-xs text-surface-600 dark:bg-surface-800 dark:text-surface-300"
                >
                  {mat}
                  <button type="button" onClick={() => quitarMaterial(i)} className="focus-ring rounded-full p-0.5 hover:bg-surface-200 dark:hover:bg-surface-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

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
              </Select>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}