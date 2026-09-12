import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import type { Espacio } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ComboboxBusqueda, type ComboboxOpcion } from '@/components/ui/ComboboxBusqueda';
import { Button } from '@/components/ui/Button';
import { tiposEspacio } from '@/constants/formOptions';
import { cn } from '@/utils/cn';
import { useSedes } from '@/hooks/useSedes';
import { uploadService } from '@/services/uploadService';
import { urlImagen } from '@/utils/imagen';
import { toast } from 'sonner';
import { generarSiguienteCodigo, validarFormatoCodigo, validarFechaNoFutura, validarAreaCapacidad } from '@/utils/format';
import { resourcesApi } from '@/services/api/resources';

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá un nombre.'),
  codigo: z.string().min(1, 'Ingresá un código.').refine(validarFormatoCodigo, 'Formato inválido. Use: A-101, B-202 (máx 3 dígitos).'),
  tipo: z.string().min(1, 'Seleccioná un tipo.'),
  sedeId: z.string().min(1, 'Seleccioná una sede.'),
  piso: z.string().min(1, 'Ingresá el piso o ubicación.'),
  areaM2: z.coerce.number().min(1, 'El área debe ser mayor a 0.'),
  capacidad: z.coerce.number().min(0, 'La capacidad no puede ser negativa.'),
  estado: z.enum(['BUENO', 'REGULAR', 'DETERIORADO', 'CRITICO']),
  ultimaInspeccion: z.string().optional().refine((val) => !val || validarFechaNoFutura(val), 'La fecha no puede ser futura.'),
  fotoUrl: z.string().optional(),
}).refine((data) => validarAreaCapacidad(data.areaM2, data.capacidad).valido, {
  message: 'El área debe ser mayor a la capacidad y la capacidad debe ser 30-90% del área.',
  path: ['capacidad'],
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
  areaM2: 0, capacidad: 0, estado: 'BUENO', ultimaInspeccion: '', fotoUrl: '',
};

interface PisoExistente {
  id: string;
  numero: number;
  bloque: string;
}

export function EspacioFormModal({ abierto, onCerrar, onGuardar, espacio, soloLectura }: EspacioFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [pisosExistentes, setPisosExistentes] = useState<PisoExistente[]>([]);
  const [cargandoPisos, setCargandoPisos] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { data: sedes = [], isLoading: sedesLoading } = useSedes();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<EspacioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  const fotoUrl = watch('fotoUrl');
  const sedeId = watch('sedeId');
  const tipo = watch('tipo');

  const cargarPisosExistentes = useCallback(async (sedeIdVal: string) => {
    if (!sedeIdVal) return;
    setCargandoPisos(true);
    try {
      const result = await resourcesApi.listar<{ id_piso: string; numero_piso: number; bloque_seccion: string }>('pisos_espacios', { 
        pageSize: 1000, 
        id_sede: sedeIdVal 
      });
      setPisosExistentes(result.data.map(p => ({ id: String(p.id_piso), numero: p.numero_piso, bloque: p.bloque_seccion })));
    } catch (error) {
      console.error('Error cargando pisos:', error);
      setPisosExistentes([]);
    } finally {
      setCargandoPisos(false);
    }
  }, []);

  useEffect(() => {
    if (sedeId) {
      cargarPisosExistentes(sedeId);
    } else {
      setPisosExistentes([]);
    }
  }, [sedeId, cargarPisosExistentes]);

  useEffect(() => {
    if (abierto) {
      if (espacio) {
        reset({ ...espacio, ultimaInspeccion: espacio.ultimaInspeccion ?? '', fotoUrl: espacio.fotoUrl ?? '' });
      } else {
        // Generar código automático solo para nuevo espacio
        const codigosExistentes: string[] = []; // Se podría cargar de la API si se desea
        const codigoSugerido = generarSiguienteCodigo(codigosExistentes);
        reset({ ...valoresVacios, codigo: codigoSugerido });
      }
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
              <img src={urlImagen(fotoUrl)} alt="Vista previa" className="h-full w-full object-cover" />
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
          <Input 
            label="Código" 
            placeholder="A-101" 
            error={errors.codigo?.message} 
            {...register('codigo')} 
            readOnly={!espacio && !soloLectura}
            title={!espacio && !soloLectura ? 'El código se genera automáticamente' : ''}
            className={!espacio && !soloLectura ? 'bg-surface-50 dark:bg-surface-800/60' : ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Tipo"
                placeholder="Buscar tipo de espacio…"
                error={errors.tipo?.message}
                opciones={tiposEspacio.map((t): ComboboxOpcion => ({ id: t, etiqueta: t }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="sedeId"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Sede"
                placeholder="Buscar sede…"
                error={errors.sedeId?.message}
                opciones={sedes.map((s): ComboboxOpcion => ({ id: s.id, etiqueta: s.nombre, detalle: s.ciudad }))}
                value={field.value}
                onChange={field.onChange}
                disabled={sedesLoading}
                vacioMensaje={sedesLoading ? 'Cargando sedes…' : 'No hay sedes disponibles.'}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Controller
            control={control}
            name="piso"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Piso / ubicación"
                placeholder="Seleccionar piso…"
                error={errors.piso?.message}
                opciones={pisosExistentes.map((p): ComboboxOpcion => ({ 
                  id: String(p.numero), 
                  etiqueta: `${p.numero}° Piso · ${p.bloque}`, 
                  detalle: p.bloque 
                }))}
                value={field.value}
                onChange={field.onChange}
                disabled={cargandoPisos || !sedeId}
                vacioMensaje={cargandoPisos ? 'Cargando pisos…' : !sedeId ? 'Primero seleccioná una sede' : 'No hay pisos registrados en esta sede'}
              />
            )}
          />
          <Input label="Área (m²)" type="number" min={1} error={errors.areaM2?.message} {...register('areaM2')} />
          <Input label="Capacidad" type="number" min={0} error={errors.capacidad?.message} {...register('capacidad')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Últ. inspección" type="date" error={errors.ultimaInspeccion?.message} {...register('ultimaInspeccion')} />
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
      </fieldset>
    </Modal>
  );
}
