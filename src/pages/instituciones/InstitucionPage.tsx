import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { resourcesApi } from '@/services/api/resources';
import { toast } from 'sonner';

interface InstitucionFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: InstitucionFormValues) => Promise<void>;
  institucion?: any;
}

const schema = z.object({
  nombre_institucion: z.string().min(2, 'Ingresá el nombre de la institución.'),
  codigo_nit_rut: z.string().min(1, 'Ingresá el código NIT/RUT.'),
  direccion: z.string().min(2, 'Ingresá la dirección.'),
  ciudad: z.string().min(1, 'Ingresá la ciudad.'),
  departamento: z.string().min(1, 'Ingresá el departamento.'),
  telefono: z.string().optional(),
  email_contacto: z.string().email('Ingresá un email válido').optional(),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  total_pisos: z.coerce.number().min(0, 'El total de pisos debe ser 0 o mayor'),
  total_aulas: z.coerce.number().min(0, 'El total de aulas debe ser 0 o mayor'),
  capacidad_maxima: z.coerce.number().min(0, 'La capacidad máxima debe ser 0 o mayor'),
  porcentaje_ocupacion_tipica: z
    .coerce.number()
    .min(0, 'El porcentaje debe ser 0 o mayor')
    .max(100, 'El porcentaje no puede ser mayor a 100')
    .default(65),
});

type InstitucionFormValues = z.infer<typeof schema>;

export function InstitucionFormModal({
  abierto,
  onCerrar,
  onGuardar,
  institucion,
  cargando: cargandoPadre,
}: InstitucionFormModalProps & { cargando?: boolean }) {
  const { setSidebarMobileAbierto } = useUiStore((s) => s);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InstitucionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_institucion: institucion?.nombre_institucion ?? '',
      codigo_nit_rut: institucion?.codigo_nit_rut ?? '',
      direccion: institucion?.direccion ?? '',
      ciudad: institucion?.ciudad ?? '',
      departamento: institucion?.departamento ?? '',
      telefono: institucion?.telefono ?? '',
      email_contacto: institucion?.email_contacto ?? '',
      estado: institucion?.estado ?? 'Activo',
      total_pisos: institucion?.total_pisos ?? 0,
      total_aulas: institucion?.total_aulas ?? 0,
      capacidad_maxima: institucion?.capacidad_maxima ?? 0,
      porcentaje_ocupacion_tipica: institucion?.porcentaje_ocupacion_tipica ?? 65,
    },
  });

  const onSubmit = async (valores: InstitucionFormValues) => {
    await onGuardar(valores);
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={institucion ? 'Editar Institución' : 'Nueva Institución'}
      descripcion="Completá los datos maestros de la institución."
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} cargando={cargandoPadre}>
            {institucion ? 'Guardar cambios' : 'Registrar institución'}
          </Button>
        </>
      }
    >
      <fieldset className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre de Institución"
            placeholder="Inst. Educativo San Martín"
            error={errors.nombre_institucion?.message}
            {...register('nombre_institucion')}
          />
          <Input
            label="Código NIT/RUT"
            placeholder="SAN-MARTIN-001"
            error={errors.codigo_nit_rut?.message}
            {...register('codigo_nit_rut')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Dirección" placeholder="Av. Principal 100" error={errors.direccion?.message} {...register('direccion')} />
          <Input label="Ciudad" placeholder="Ciudad" error={errors.ciudad?.message} {...register('ciudad')} />
          <Input
            label="Departamento"
            placeholder="Departamento"
            error={errors.departamento?.message}
            {...register('departamento')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            placeholder="Tel. de contacto"
            type="tel"
            error={errors.telefono?.message}
            {...register('telefono')}
          />
          <Input
            label="Email Contacto"
            placeholder="contacto@inst.edu.ar"
            type="email"
            error={errors.email_contacto?.message}
            {...register('email_contacto')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total de Pisos"
            type="number"
            min={0}
            error={errors.total_pisos?.message}
            {...register('total_pisos')}
          />
          <Input
            label="Total de Aulas"
            type="number"
            min={0}
            error={errors.total_aulas?.message}
            {...register('total_aulas')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Capacidad Máxima"
            type="number"
            min={0}
            error={errors.capacidad_maxima?.message}
            {...register('capacidad_maxima')}
          />
          <Input
            label="% Ocupación Typica"
            type="number"
            min={0}
            max={100}
            error={errors.porcentaje_ocupacion_tipica?.message}
            {...register('porcentaje_ocupacion_tipica')}
          />
        </div>

        <div>
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select label="Estado" value={field.value} onChange={field.onChange} error={errors.estado?.message}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Select>
            )}
          />
        </div>
      </fieldset>
    </Modal>
  );
}

/* Exporta la función principal para usar en el contenedor */
export function InstitucionManager() {
  const [institucion, setInstitucion] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const session = useAuthStore((s) => s.session);

  // Cargar institución actual (solo admin)
  useEffect(() => {
    if (session?.usuario?.rol === 'Administrador') {
      resourcesApi.obtener<any>('instituciones', '1').then((data) => {
        setInstitucion(data);
      });
    }
  }, [session?.usuario?.rol]);

  const abrirModal = () => setEditando(true);
  const cerrarModal = () => { setEditando(false); setGuardando(false); };

  const guardar = async (valores: InstitucionFormValues) => {
    setGuardando(true);
    try {
      if (institucion) {
        await resourcesApi.actualizar<any, InstitucionFormValues>('instituciones', institucion.id_institucion, valores);
      } else {
        await resourcesApi.crear<any, InstitucionFormValues>('instituciones', valores);
      }
      toast.success('Institución guardada correctamente.');
      cerrarModal();
      // Recargar datos
      const data = await resourcesApi.obtener<any>('instituciones', '1');
      setInstitucion(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la institución.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-6">
        Datos Maestros de la Institución
      </h2>

      <div className="card bg-white dark:bg-surface-900 p-6 rounded-xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">
            {session?.usuario?.rol === 'Administrador' ? 'Configuración Institucional' : 'Datos de la Institución'}
          </h3>
          {session?.usuario?.rol === 'Administrador' && (
            <Button
              variant="outline"
              size="sm"
              onClick={abrirModal}
              aria-label="Editar datos de institución"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 7a2 2 0 012 2h3a2 2 0 010 4h-3a2 2 0 01-2-2V7zM5 11a2 2 0 012-2h4a2 2 0 010 4H7a2 2 0 01-2-2V11zM6 4a2 2 0 012 2h2a2 2 0 010 2H6a2 2 0 01-2-2V4zm7.136 11.864a1 1 0 010 1.414l-.536.536a1 1 0 11-1.414-1.414l.536-.536a1 1 0 011.414 1.414l-.027.055a6.6 6 0 01-.357 1.313l-.828.608a5.5 5.5 0 00-.066 1.717l-.595 1.488a4.5 4.5 0 00.164.818l-.019.1a4.5 4.5 0 00.89-.318l.675-.568a3.5 3.5 0 00.69-.518l-.418-.785a2.5 2.5 0 00-.152-.308l-.327-.308a1.5 1.5 0 00-.117-.278l-.297-1.038z" />
              </svg>
              Configurar
            </Button>
          )}
        </div>

        {session?.usuario?.rol !== 'Administrador' && (
          <p className="text-surface-500 dark:text-surface-300 text-sm mt-4">
            Los datos maestros de la institución son gestionados por el administrador.
          </p>
        )}

        {/* Mostrar resumen de datos actuales */}
        {institucion && (
          <div className="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
            <h4 className="font-medium text-surface-900 dark:text-white mb-3">
              {session?.usuario?.rol === 'Administrador' ? 'Resumen Actual' : 'Datos de la Institución'}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-surface-600 dark:text-surface-400">
              <div>
                <p><strong>Nombre:</strong> {institucion.nombre_institucion}</p>
                <p><strong>Código:</strong> {institucion.codigo_nit_rut}</p>
                <p><strong>Ciudad:</strong> {institucion.ciudad}</p>
                <p><strong>Departamento:</strong> {institucion.departamento}</p>
              </div>
              <div>
                <p><strong>Dirección:</strong> {institucion.direccion}</p>
                <p><strong>Teléfono:</strong> {institucion.telefono || '—'}</p>
                <p><strong>Email:</strong> {institucion.email_contacto || '—'}</p>
                <p><strong>Estado:</strong> {institucion.estado}</p>
              </div>
              <div>
                <p><strong>Total Pisos:</strong> {institucion.total_pisos}</p>
                <p><strong>Total Aulas:</strong> {institucion.total_aulas}</p>
              </div>
              <div>
                <p><strong>Cap. Máxima:</strong> {institucion.capacidad_maxima} m²</p>
                <p><strong>% Ocupación:</strong> {institucion.porcentaje_ocupacion_tipica}%</p>
              </div>
            </div>
          </div>
        )}

        {!institucion && (
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-4 text-center py-8">
            No hay datos de institución configurados.
          </p>
        )}
      </div>

      <InstitucionFormModal
        abierto={editando}
        onCerrar={cerrarModal}
        onGuardar={guardar}
        institucion={institucion}
        cargando={guardando}
      />
    </div>
  );
}