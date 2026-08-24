import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Usuario } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { mockSedes } from '@/services/mock/mockData';

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá un nombre.'),
  correo: z.string().min(1, 'Ingresá un correo.').email('Correo inválido.'),
  rol: z.enum(['ADMIN', 'COORDINADOR', 'INSPECTOR', 'MANTENIMIENTO']),
  sede: z.string().min(1, 'Seleccioná una sede.'),
  activo: z.boolean(),
});

export type UsuarioFormValues = z.infer<typeof schema>;

interface UsuarioFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: UsuarioFormValues) => Promise<void>;
  usuario?: Usuario | null;
}

const valoresVacios: UsuarioFormValues = {
  nombre: '', correo: '', rol: 'INSPECTOR', sede: mockSedes[0]?.nombre ?? '', activo: true,
};

export function UsuarioFormModal({ abierto, onCerrar, onGuardar, usuario }: UsuarioFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UsuarioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    if (abierto) reset(usuario ? { ...usuario } : valoresVacios);
  }, [abierto, usuario, reset]);

  const onSubmit = async (valores: UsuarioFormValues) => {
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
      titulo={usuario ? 'Editar usuario' : 'Nuevo usuario'}
      descripcion="Completá los datos de acceso del usuario."
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
            {usuario ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre completo" placeholder="Carlos Rivas" error={errors.nombre?.message} {...register('nombre')} />
        <Input label="Correo institucional" type="email" placeholder="crivas@infraedu.ar" error={errors.correo?.message} {...register('correo')} />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="rol"
            render={({ field }) => (
              <Select label="Rol" value={field.value} onChange={field.onChange}>
                <option value="ADMIN">Administrador</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="INSPECTOR">Inspector</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </Select>
            )}
          />
          <Select label="Sede" error={errors.sede?.message} {...register('sede')}>
            {mockSedes.map((s) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
          <input type="checkbox" className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" {...register('activo')} />
          Usuario activo (puede iniciar sesión)
        </label>
      </div>
    </Modal>
  );
}