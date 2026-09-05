import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { RolSistema, UsuarioAdmin } from '@/services/usuariosService';

const tiposDocumento = ['CC', 'TI', 'CE', 'PAS', 'NIT'] as const;

const schema = z.object({ tipo_documento: z.string().min(1, 'Seleccioná un tipo de documento.'), documento_id: z.string().min(3, 'Ingresá el documento.'), nombres: z.string().min(2, 'Ingresá el nombre.'), apellidos: z.string().min(2, 'Ingresá el apellido.'), email: z.string().email('Correo inválido.'), telefono: z.string().max(20).optional(), id_rol: z.coerce.number().positive('Seleccioná un rol.'), id_institucion: z.string().optional(), estado: z.enum(['Activo', 'Inactivo']), password: z.string().optional() });
export type UsuarioFormValues = z.infer<typeof schema>;
interface Props { abierto: boolean; onCerrar: () => void; onGuardar: (valores: UsuarioFormValues) => Promise<void>; usuario?: UsuarioAdmin | null; roles: RolSistema[]; }
const empty: UsuarioFormValues = { tipo_documento: 'CC', documento_id: '', nombres: '', apellidos: '', email: '', telefono: '', id_rol: 0, id_institucion: '', estado: 'Activo', password: '' };

export function UsuarioFormModal({ abierto, onCerrar, onGuardar, usuario, roles }: Props) {
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<UsuarioFormValues>({ resolver: zodResolver(schema), defaultValues: empty });
  useEffect(() => { if (abierto) reset(usuario ? { ...usuario, id_institucion: String(usuario.id_institucion ?? ''), password: '' } : { ...empty, id_rol: roles[0]?.id_rol ?? 0 }); }, [abierto, usuario, roles, reset]);
  const submit = async (values: UsuarioFormValues) => { if (!usuario && (!values.password || values.password.length < 8)) { setError('password', { message: 'La contraseña inicial debe tener al menos 8 caracteres.' }); return; } setGuardando(true); try { await onGuardar(values); onCerrar(); } finally { setGuardando(false); } };
  return <Modal abierto={abierto} onCerrar={onCerrar} titulo={usuario ? 'Editar usuario' : 'Agregar usuario'} descripcion="Los usuarios se bloquean; no se eliminan para conservar la trazabilidad." footer={<><Button variant="outline" onClick={onCerrar}>Cancelar</Button><Button onClick={handleSubmit(submit)} cargando={guardando}>{usuario ? 'Guardar cambios' : 'Crear usuario'}</Button></>}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Controller control={control} name="tipo_documento" render={({ field }) => <Select label="Tipo de documento" value={field.value} onChange={field.onChange}><option value="">Seleccioná</option>{tiposDocumento.map((t) => <option key={t} value={t}>{t}</option>)}</Select>} /><Input label="Documento" error={errors.documento_id?.message} {...register('documento_id')} autoComplete="off" /></div><div className="grid grid-cols-2 gap-4"><Input label="Nombre" error={errors.nombres?.message} {...register('nombres')} autoComplete="off" /><Input label="Apellido" error={errors.apellidos?.message} {...register('apellidos')} autoComplete="off" /></div><Input label="Correo institucional" type="email" error={errors.email?.message} {...register('email')} autoComplete="off" /><div className="grid grid-cols-2 gap-4"><Input label="Teléfono" {...register('telefono')} autoComplete="off" /><Input label="Institución (ID)" {...register('id_institucion')} autoComplete="off" /></div><div className="grid grid-cols-2 gap-4"><Controller control={control} name="id_rol" render={({ field }) => <Select label="Rol" value={String(field.value || '')} onChange={(e) => field.onChange(Number(e.target.value))}><option value="">Seleccioná un rol</option>{roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}</Select>} /><Controller control={control} name="estado" render={({ field }) => <Select label="Estado de acceso" value={field.value} onChange={field.onChange}><option value="Activo">Activo</option><option value="Inactivo">Bloqueado</option></Select>} /></div><Input label={usuario ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'} type="password" error={errors.password?.message} {...register('password')} autoComplete="new-password" /></div></Modal>;
}
