import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ImagePlus, Check, AlertCircle, HelpCircle } from 'lucide-react';
import type { ChecklistItem, Inspeccion } from '@/types';
import type { InspeccionInput } from '@/services/inspeccionesService';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ComboboxBusqueda, type ComboboxOpcion } from '@/components/ui/ComboboxBusqueda';
import { Button } from '@/components/ui/Button';
import { checklistBase } from '@/constants/formOptions';
import { cn } from '@/utils/cn';
import { urlImagen } from '@/utils/imagen';
import { useActivos } from '@/hooks/useActivos';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { validarFechaNoFutura } from '@/utils/format';

const schema = z.object({
  espacioId: z.string().min(1, 'Seleccioná un activo/espacio.'),
  inspector: z.string().min(2, 'Ingresá el nombre del inspector.'),
  fecha: z.string().min(1, 'Ingresá la fecha.').refine(validarFechaNoFutura, 'La fecha no puede ser futura.'),
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

// Roles que pueden ver/gestionar evidencias: Coordinador, Administrador, Rector
const ROLES_CON_ACCESO_EVIDENCIAS = ['Coordinador', 'Administrador', 'Rector'];

function tieneAccesoEvidencias(): boolean {
  const usuario = useAuthStore.getState().session?.usuario;
  return usuario ? ROLES_CON_ACCESO_EVIDENCIAS.includes(usuario.rol) : false;
}

export function EvaluacionFormModal({ abierto, onCerrar, onGuardar, inspeccion, soloLectura }: EvaluacionFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(checklistInicial());
  const [itemNuevo, setItemNuevo] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { data: activos = [], isLoading } = useActivos();
  const usuario = useAuthStore.getState().session?.usuario;
  const puedeVerEvidencias = usuario && ROLES_CON_ACCESO_EVIDENCIAS.includes(usuario.rol);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    if (abierto) {
      if (inspeccion) {
        reset({ espacioId: inspeccion.espacioId, inspector: inspeccion.inspector, fecha: inspeccion.fecha, notas: inspeccion.notas ?? '' });
        setChecklist(inspeccion.checklist.length > 0 ? inspeccion.checklist : checklistInicial());
        setEvidencias(inspeccion.evidencias || []);
      } else {
        reset(valoresVacios);
        setChecklist(checklistInicial());
        setEvidencias([]);
      }
    }
  }, [abierto, inspeccion, reset]);

  const toggleItem = useCallback((id: string) => {
    if (soloLectura) return;
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, cumple: !c.cumple } : c)));
  }, [soloLectura]);

  const agregarItem = useCallback(() => {
    const texto = itemNuevo.trim();
    if (!texto) return;
    setChecklist((prev) => [...prev, { id: `chk-${Date.now()}`, texto, cumple: true }]);
    setItemNuevo('');
  }, [itemNuevo]);

  const quitarItem = useCallback((id: string) => setChecklist((prev) => prev.filter((c) => c.id !== id)), []);

  const procesarArchivos = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadService.subirImagen(file)));
      setEvidencias((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} imagen(es) subida(s) correctamente.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron subir las evidencias.');
    }
  };

  const borrarEvidencia = async (index: number) => {
    try {
      await uploadService.borrarImagen(evidencias[index]);
    } catch {
      // Ignorar error si la imagen no se pudo borrar del servidor
    }
    setEvidencias((prev) => prev.filter((_, idx) => idx !== index));
  };

  const buenos = checklist.filter((c) => c.cumple).length;
  const total = checklist.length;
  const puntaje = total ? Math.round((buenos / total) * 100) : 0;
  const estado = puntaje >= 80 ? 'BUENO' : puntaje >= 60 ? 'REGULAR' : puntaje >= 40 ? 'DETERIORADO' : 'CRITICO';

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'BUENO': return 'text-success-600 bg-success-50 dark:bg-success-500/10';
      case 'REGULAR': return 'text-warning-600 bg-warning-50 dark:bg-warning-500/10';
      case 'DETERIORADO': return 'text-orange-600 bg-orange-50 dark:bg-orange-500/10';
      case 'CRITICO': return 'text-danger-600 bg-danger-50 dark:bg-danger-500/10';
      default: return 'text-surface-600 bg-surface-50';
    }
  };

  const onSubmit = async (valores: FormValues) => {
    const activo = activos.find((a) => a.id === valores.espacioId);
    if (!activo) {
      toast.error('El activo seleccionado no existe.');
      return;
    }
    if (checklist.length === 0) {
      toast.error('El checklist no puede estar vacío.');
      return;
    }
    setGuardando(true);
    try {
      await onGuardar({ ...valores, espacioNombre: activo.nombre, checklist, evidencias });
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
      descripcion={soloLectura ? undefined : 'Completá el checklist de estado del activo. El puntaje se calcula automáticamente.'}
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
        {/* Header con información principal */}
        <div className="grid grid-cols-3 gap-4">
          <Controller
            control={control}
            name="espacioId"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Activo / Espacio a evaluar"
                placeholder="Buscar activo…"
                error={errors.espacioId?.message}
                opciones={activos.map((a): ComboboxOpcion => ({ id: a.id, etiqueta: `${a.codigo} · ${a.nombre}`, detalle: a.espacioNombre }))}
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                vacioMensaje={isLoading ? 'Cargando activos…' : 'No hay activos disponibles.'}
              />
            )}
          />
          <Input label="Inspector" placeholder="Nombre completo del inspector" error={errors.inspector?.message} {...register('inspector')} />
          <Input label="Fecha de evaluación" type="date" error={errors.fecha?.message} {...register('fecha')} />
        </div>

        {/* Puntaje global visible */}
        <div className={cn('p-4 rounded-xl border', getEstadoColor(estado))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-2xl font-bold', getEstadoColor(estado).replace('text-', '').replace('bg-', 'bg-'))}>
                {puntaje}/100
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-white">Puntaje global</p>
                <p className="text-sm text-surface-500">{buenos} de {total} ítems en buen estado · Estado: {estado}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setMostrarAyuda(!mostrarAyuda)} aria-label="Ayuda">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
          {mostrarAyuda && (
            <div className="mt-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-sm text-surface-600 dark:text-surface-300 space-y-1">
              <p><strong>Cómo se calcula:</strong> Cada ítem del checklist vale lo mismo. El puntaje es el porcentaje de ítems marcados como "Cumple".</p>
              <p>
              <strong>Rangos:</strong> ≥80% Bueno · 60-79% Regular · 40-59% Deteriorado · &lt;40% Crítico
              </p>
              <p><strong>Tip:</strong> Marcá solo lo que realmente está en buen estado para un diagnóstico realista.</p>
            </div>
          )}
        </div>

        {/* Checklist mejorado */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-200 flex items-center gap-2">
              Checklist de evaluación
              <HelpCircle className="h-4 w-4 text-surface-400" aria-label="Marcá cada ítem según su estado actual" />
            </label>
            {!soloLectura && (
              <div className="flex items-center gap-2">
<Button type="button" variant="outline" size="sm" onClick={() => setChecklist(prev => prev.map(c => ({ ...c, cumple: true })))}> 
                  <Check className="h-3.5 w-3.5 mr-1" /> Marcar todo
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setChecklist(prev => prev.map(c => ({ ...c, cumple: false })))}> 
                  <X className="h-3.5 w-3.5 mr-1" /> Desmarcar todo
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-1 rounded-xl border border-surface-100 p-2 dark:border-surface-800 max-h-72 overflow-y-auto">
            {checklist.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium text-surface-400 bg-surface-100 dark:bg-surface-800">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                    item.cumple
                      ? 'border-success-500 bg-success-500 text-white shadow-sm shadow-success-500/20'
                      : 'border-surface-300 bg-white dark:border-surface-600 dark:bg-surface-900'
                  )}
                  aria-label={item.cumple ? 'Marcar como no cumple' : 'Marcar como cumple'}
                >
                  <Check className={cn('h-3.5 w-3.5', item.cumple ? 'text-white' : 'text-transparent')} />
                </button>
                <span className={cn('flex-1 text-sm leading-relaxed', item.cumple ? 'text-surface-700 dark:text-surface-200' : 'text-danger-600 dark:text-danger-400')}>
                  {item.texto}
                </span>
                {!soloLectura && (
                  <button type="button" onClick={() => quitarItem(item.id)} className="focus-ring rounded p-1.5 text-surface-300 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10" aria-label="Eliminar ítem">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {!soloLectura && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Agregar ítem personalizado al checklist..."
                value={itemNuevo}
                onChange={(e) => setItemNuevo(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarItem(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={agregarItem} aria-label="Agregar ítem">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200 flex items-center gap-2">
            Observaciones generales
            <HelpCircle className="h-4 w-4 text-surface-400" aria-label="Notas adicionales sobre la evaluación" />
          </label>
          <textarea
            rows={3}
            placeholder="Observaciones, hallazgos, recomendaciones..."
            className="focus-ring w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
            {...register('notas')}
          />
        </div>

        {/* Evidencias fotográficas con control de permisos */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200 flex items-center gap-2">
            Evidencias fotográficas
            {puedeVerEvidencias && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                Visible para: Coordinador, Admin, Rector
              </span>
            )}
            {!puedeVerEvidencias && !soloLectura && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                Solo subida (lectura: Coordinador, Admin, Rector)
              </span>
            )}
          </label>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => { e.preventDefault(); setArrastrando(false); procesarArchivos(e.dataTransfer.files); }}
            onClick={() => !soloLectura && inputFileRef.current?.click()}
            className={cn(
              'flex min-h-28 cursor-pointer flex-wrap items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors',
              arrastrando ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60',
              soloLectura && 'cursor-default'
            )}
          >
            {evidencias.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {evidencias.map((url, i) => (
                  <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700">
                    <img src={urlImagen(url)} alt={`Evidencia ${i + 1}`} className="h-full w-full object-cover" />
                    {!soloLectura && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); borrarEvidencia(i); }}
                        className="absolute inset-0 flex items-center justify-center bg-surface-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar evidencia"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                    {puedeVerEvidencias && !soloLectura && (
                      <a href={urlImagen(url)} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-1 p-1 bg-white/90 dark:bg-surface-900/90 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30" aria-label="Ver en tamaño completo">
                        <ImagePlus className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!soloLectura && (
              <div className="flex h-20 w-20 flex-col items-center justify-center gap-1.5 text-surface-400 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs text-center px-2">Arrastrá fotos o hacé clic</span>
              </div>
            )}
            
            {evidencias.length === 0 && soloLectura && (
              <div className="flex flex-col items-center justify-center gap-2 text-surface-400 py-8">
                <ImagePlus className="h-10 w-10 opacity-50" />
                <p className="text-sm">No hay evidencias registradas</p>
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
          
          {evidencias.length > 0 && (
            <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
              {evidencias.length} imagen(es) adjunta(s). {puedeVerEvidencias ? 'Hacé clic en la imagen para verla en grande.' : 'Las evidencias son visibles para Coordinador, Administrador y Rector.'}
            </p>
          )}
        </div>
      </fieldset>
    </Modal>
  );
}
