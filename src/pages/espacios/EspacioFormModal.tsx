import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X } from 'lucide-react';
import type { Espacio } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { tiposEspacio } from '@/constants/formOptions';
import { cn } from '@/utils/cn';
import { useSedes } from '@/hooks/useSedes';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá un nombre.'),
  codigo: z.string().min(1, 'Ingresá un código.'),
  tipo: z.string().min(1, 'Seleccioná un tipo.'),
  sedeId: z.string().min(1, 'Seleccioná una sede.'),
  piso: z.string().min(1, 'Ingresá el piso o ubicación.'),
  areaM2: z.coerce.number().min(1, 'El área debe ser mayor a 0.'),
  capacidad: z.coerce.number().min(0, 'La capacidad no puede ser negativa.'),
  estado: z.enum(['BUENO', 'REGULAR', 'DETERIORADO', 'CRITICO']),
  fotoUrl: z.string().optional(),
});

export type EspacioFormValues = z.infer<typeof schema>;

interface EspacioFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: EspacioFormValues) => Promise<void>;
  espacio?: Espacio | null;
  soloLectura?: boolean;
}

const valoresVacios: EspacioFormValues = {
  nombre: '', codigo: '', tipo: '', sedeId: '', piso: '',
  areaM2: 0, capacidad: 0, estado: 'BUENO', fotoUrl: '',
};

export function EspacioFormModal({ abierto, onCerrar, onGuardar, espacio, soloLectura }: EspacioFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { data: sedes = [], isLoading: sedesLoading } = useSedes();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<EspacioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  const fotoUrl = watch('fotoUrl');

  useEffect(() => {
    if (abierto) {
      reset(espacio ? { ...espacio, fotoUrl: espacio.fotoUrl ?? '' } : valoresVacios);
    }
  }, [abierto, espacio, reset]);

  const procesarArchivo = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadService.subirImagen(file);
      setValue('fotoUrl', url, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    }
  };

  const onSubmit = async (valores: EspacioFormValues) => {
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
      titulo={soloLectura ? 'Detalle del espacio' : espacio ? 'Editar espacio' : 'Nuevo espacio'}
      descripcion={soloLectura ? undefined : 'Completá la información física del espacio.'}
      size="md"
      footer={
        !soloLectura && (
          <>
            <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
              {espacio ? 'Guardar cambios' : 'Registrar espacio'}
            </Button>
          </>
        )
      }
    >
      <fieldset disabled={soloLectura} className="space-y-4">
        
        <div
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            procesarArchivo(e.dataTransfer.files?.[0]);
          }}
          onClick={() => !soloLectura && inputFileRef.current?.click()}
          className={cn(
            'relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors',
            arrastrando ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60',
            soloLectura && 'cursor-default'
          )}
        >
          {fotoUrl ? (
            <>
              <img src={fotoUrl} alt="Vista previa" className="h-full w-full object-cover" />
              {!soloLectura && (
                <button
                  type="button"
                  onClick={async (e) => { e.stopPropagation(); try { await uploadService.borrarImagen(fotoUrl); } catch { /* Puede ser una imagen heredada. */ } setValue('fotoUrl', ''); }}
                  className="focus-ring absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface-950/70 text-white hover:bg-surface-950"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-surface-400">
              <ImagePlus className="h-6 w-6" />
              <p className="text-xs">Arrastrá una foto o hacé clic para subir</p>
            </div>
          )}
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => procesarArchivo(e.target.files?.[0])}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre" placeholder="Aula 101" error={errors.nombre?.message} {...register('nombre')} />
          <Input label="Código" placeholder="A-101" error={errors.codigo?.message} {...register('codigo')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" error={errors.tipo?.message} {...register('tipo')}>
            <option value="">Seleccioná un tipo</option>
            {tiposEspacio.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Sede" error={errors.sedeId?.message} {...register('sedeId')} disabled={sedesLoading}>
            <option value="">Seleccioná una sede</option>
            {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Piso / ubicación" placeholder="1er Piso" error={errors.piso?.message} {...register('piso')} />
          <Input label="Área (m²)" type="number" min={0} error={errors.areaM2?.message} {...register('areaM2')} />
          <Input label="Capacidad" type="number" min={0} error={errors.capacidad?.message} {...register('capacidad')} />
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
      </fieldset>
    </Modal>
  );
}
