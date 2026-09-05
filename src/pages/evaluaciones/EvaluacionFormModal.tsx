import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ImagePlus, Check } from 'lucide-react';
import type { ChecklistItem, Inspeccion } from '@/types';
import type { InspeccionInput } from '@/services/inspeccionesService';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { checklistBase } from '@/constants/formOptions';
import { cn } from '@/utils/cn';
import { urlImagen } from '@/utils/imagen';
import { useActivos } from '@/hooks/useActivos';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';

const schema = z.object({
  espacioId: z.string().min(1, 'Seleccioná un espacio.'),
  inspector: z.string().min(2, 'Ingresá el inspector.'),
  fecha: z.string().min(1, 'Ingresá la fecha.'),
  notas: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EvaluacionFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: InspeccionInput) => Promise<void>;
  inspeccion?: Inspeccion | null;
  soloLectura?: boolean;
}

const checklistInicial = (): ChecklistItem[] =>
  checklistBase.map((texto, i) => ({ id: `chk-${i}`, texto, cumple: true }));

const valoresVacios: FormValues = {
  espacioId: '', inspector: '',
  fecha: new Date().toISOString().slice(0, 10), notas: '',
};

export function EvaluacionFormModal({ abierto, onCerrar, onGuardar, inspeccion, soloLectura }: EvaluacionFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(checklistInicial());
  const [itemNuevo, setItemNuevo] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { data: activos = [], isLoading } = useActivos();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    if (abierto) {
      if (inspeccion) {
        reset({ espacioId: inspeccion.espacioId, inspector: inspeccion.inspector, fecha: inspeccion.fecha, notas: inspeccion.notas ?? '' });
        setChecklist(inspeccion.checklist);
        setEvidencias(inspeccion.evidencias);
      } else {
        reset(valoresVacios);
        setChecklist(checklistInicial());
        setEvidencias([]);
      }
    }
  }, [abierto, inspeccion, reset]);

  const toggleItem = (id: string) => {
    if (soloLectura) return;
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, cumple: !c.cumple } : c)));
  };

  const agregarItem = () => {
    const texto = itemNuevo.trim();
    if (!texto) return;
    setChecklist((prev) => [...prev, { id: `chk-${Date.now()}`, texto, cumple: true }]);
    setItemNuevo('');
  };

  const quitarItem = (id: string) => setChecklist((prev) => prev.filter((c) => c.id !== id));

  const procesarArchivos = async (files?: FileList | null) => {
    if (!files) return;
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadService.subirImagen(file)));
      setEvidencias((prev) => [...prev, ...urls]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron subir las evidencias.');
    }
  };

  const buenos = checklist.filter((c) => c.cumple).length;
  const puntaje = checklist.length ? Math.round((buenos / checklist.length) * 100) : 0;

  const onSubmit = async (valores: FormValues) => {
    const activo = activos.find((a) => a.id === valores.espacioId);
    setGuardando(true);
    try {
      await onGuardar({ ...valores, espacioNombre: activo?.nombre ?? '', checklist, evidencias });
      onCerrar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={soloLectura ? `Evaluación · ${inspeccion?.espacioNombre}` : inspeccion ? 'Editar evaluación' : 'Nueva evaluación'}
      descripcion={soloLectura ? undefined : 'Completá el checklist de estado del espacio.'}
      size="lg"
      footer={
        !soloLectura && (
          <>
            <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
              {inspeccion ? 'Guardar cambios' : 'Registrar evaluación'}
            </Button>
          </>
        )
      }
    >
      <fieldset disabled={soloLectura} className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <Select label="Activo evaluado" error={errors.espacioId?.message} {...register('espacioId')} disabled={isLoading}>
            <option value="">Seleccioná un activo</option>
            {activos.map((a) => <option key={a.id} value={a.id}>{a.codigo} · {a.nombre}</option>)}
          </Select>
          <Input label="Inspector" placeholder="Patricia Núñez" error={errors.inspector?.message} {...register('inspector')} />
          <Input label="Fecha" type="date" error={errors.fecha?.message} {...register('fecha')} />
        </div>

        {/* Checklist */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-200">Checklist</label>
            <span className="text-xs text-surface-400">Puntaje: <span className="font-semibold text-surface-700 dark:text-surface-200">{puntaje}/100</span> · {buenos}/{checklist.length} en buen estado</span>
          </div>
          <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-surface-100 p-2 dark:border-surface-800">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800/60">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                    item.cumple
                      ? 'border-success-500 bg-success-500 text-white'
                      : 'border-surface-300 text-transparent dark:border-surface-600'
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className={cn('flex-1 text-sm', item.cumple ? 'text-surface-700 dark:text-surface-200' : 'text-danger-500')}>
                  {item.texto}
                </span>
                {!soloLectura && (
                  <button type="button" onClick={() => quitarItem(item.id)} className="focus-ring rounded p-1 text-surface-300 hover:text-danger-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!soloLectura && (
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Agregar ítem al checklist..."
                value={itemNuevo}
                onChange={(e) => setItemNuevo(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarItem(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={agregarItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">Observaciones</label>
          <textarea
            rows={2}
            placeholder="Notas generales de la evaluación..."
            className="focus-ring w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            {...register('notas')}
          />
        </div>

        {/* Evidencias fotográficas */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">Evidencias fotográficas</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => { e.preventDefault(); setArrastrando(false); procesarArchivos(e.dataTransfer.files); }}
            onClick={() => !soloLectura && inputFileRef.current?.click()}
            className={cn(
              'flex min-h-24 cursor-pointer flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3 transition-colors',
              arrastrando ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60',
              soloLectura && 'cursor-default'
            )}
          >
            {evidencias.map((url, i) => (
              <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg">
                <img src={urlImagen(url)} alt={`Evidencia ${i + 1}`} className="h-full w-full object-cover" />
                {!soloLectura && (
                  <button
                    type="button"
                    onClick={async (e) => { e.stopPropagation(); try { await uploadService.borrarImagen(url); } catch { /* Puede ser una imagen anterior no gestionada por esta API. */ } setEvidencias((prev) => prev.filter((_, idx) => idx !== i)); }}
                    className="absolute inset-0 flex items-center justify-center bg-surface-950/60 text-white opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!soloLectura && (
              <div className="flex h-16 w-16 flex-col items-center justify-center gap-1 text-surface-400">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Agregar</span>
              </div>
            )}
            <input
              ref={inputFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => procesarArchivos(e.target.files)}
            />
          </div>
        </div>
      </fieldset>
    </Modal>
  );
}
