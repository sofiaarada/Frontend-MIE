import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { profileService, type PerfilInput } from '@/services/profileService';
import { uploadService } from '@/services/uploadService';
import { useAuthStore } from '@/store/authStore';

type PasswordValues = { passwordActual: string; passwordNueva: string; confirmarPassword: string };

export function PerfilPage() {
  const queryClient = useQueryClient();
  const actualizarUsuario = useAuthStore((s) => s.actualizarUsuario);
  const [tab, setTab] = useState('general');
  const [guardando, setGuardando] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: perfil, isLoading } = useQuery({ queryKey: ['perfil'], queryFn: profileService.obtener });
  const form = useForm<PerfilInput>();
  const passwordForm = useForm<PasswordValues>();

  useEffect(() => { if (perfil) form.reset(perfil); }, [perfil, form]);
  const actualizarSesion = (p: Awaited<ReturnType<typeof profileService.actualizar>>) => actualizarUsuario({
    id: p.id_usuario, nombre: `${p.nombres} ${p.apellidos}`, correo: p.email, rol: p.nombre_rol,
    sede: p.id_institucion ?? '', activo: true, avatarUrl: p.avatar_url ?? undefined, creadoEn: '',
  });
  const guardar = async (values: PerfilInput) => {
    setGuardando(true);
    try { const updated = await profileService.actualizar(values); actualizarSesion(updated); queryClient.setQueryData(['perfil'], updated); queryClient.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Perfil actualizado.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo guardar el perfil.'); }
    finally { setGuardando(false); }
  };
  const cambiarFoto = async (file?: File) => {
    if (!file || !perfil) return;
    try {
      const avatar_url = await uploadService.subirImagen(file);
      const updated = await profileService.actualizar({ ...form.getValues(), avatar_url });
      actualizarSesion(updated); queryClient.setQueryData(['perfil'], updated); form.setValue('avatar_url', avatar_url); toast.success('Foto de perfil actualizada.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo subir la foto.'); }
  };
  const guardarPassword = async (values: PasswordValues) => {
    if (values.passwordNueva !== values.confirmarPassword) { passwordForm.setError('confirmarPassword', { message: 'Las contraseñas no coinciden.' }); return; }
    setGuardandoPassword(true);
    try { await profileService.cambiarPassword(values.passwordActual, values.passwordNueva); passwordForm.reset(); toast.success('Contraseña actualizada.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.'); }
    finally { setGuardandoPassword(false); }
  };
  if (isLoading || !perfil) return <p className="text-sm text-surface-500">Cargando perfil…</p>;
  return <div className="mx-auto max-w-5xl space-y-5">
    <div><h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Perfil</h1><p className="mt-1 text-sm text-surface-500">Administrá tus datos personales y seguridad.</p></div>
    <Card className="overflow-hidden">
      <div className="border-b border-surface-200 px-5 py-4 dark:border-surface-800"><Tabs opciones={[{ value: 'general', label: 'Descripción general' }, { value: 'editar', label: 'Editar perfil' }]} valor={tab} onChange={setTab} /></div>
      {tab === 'general' ? <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]"><div className="relative mx-auto"><Avatar nombre={`${perfil.nombres} ${perfil.apellidos}`} src={perfil.avatar_url ?? undefined} size="lg" className="h-24 w-24 text-2xl" /><button type="button" onClick={() => fileRef.current?.click()} aria-label="Cambiar foto de perfil" className="absolute -bottom-1 -right-1 rounded-full bg-primary-600 p-2 text-white shadow-soft"><Camera className="h-4 w-4" /></button><input ref={fileRef} onChange={(e) => cambiarFoto(e.target.files?.[0])} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></div><div><h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">{perfil.nombres} {perfil.apellidos}</h2><p className="text-sm text-surface-500">{perfil.nombre_rol}</p><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-surface-400">Email</dt><dd>{perfil.email}</dd></div><div><dt className="text-surface-400">Teléfono</dt><dd>{perfil.telefono || 'Sin registrar'}</dd></div><div><dt className="text-surface-400">Documento</dt><dd>{perfil.documento_id}</dd></div><div><dt className="text-surface-400">Dirección</dt><dd>{perfil.direccion || 'Sin registrar'}</dd></div></dl><Button className="mt-6" variant="outline" icono={<UserRound className="h-4 w-4" />} onClick={() => setTab('editar')}>Editar perfil</Button></div></div> :
      <form onSubmit={form.handleSubmit(guardar)} className="space-y-7 p-6"><section><h2 className="font-display text-base font-semibold text-surface-800 dark:text-white">Información personal</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Input label="Nombre" error={form.formState.errors.nombres?.message} {...form.register('nombres', { required: 'El nombre es obligatorio.' })}/><Input label="Apellido" error={form.formState.errors.apellidos?.message} {...form.register('apellidos', { required: 'El apellido es obligatorio.' })}/><Input label="Documento" error={form.formState.errors.documento_id?.message} {...form.register('documento_id', { required: 'El documento es obligatorio.' })}/><Input label="Teléfono" {...form.register('telefono')}/><Input label="Email" type="email" className="sm:col-span-2" error={form.formState.errors.email?.message} {...form.register('email', { required: 'El correo es obligatorio.' })}/><Input label="Dirección" className="sm:col-span-2" {...form.register('direccion')}/></div></section><section className="border-t border-surface-200 pt-6 dark:border-surface-800"><h2 className="font-display text-base font-semibold text-surface-800 dark:text-white">Cambiar contraseña</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Input label="Contraseña actual" type="password" className="sm:col-span-2" {...passwordForm.register('passwordActual')}/><Input label="Nueva contraseña" type="password" {...passwordForm.register('passwordNueva')}/><Input label="Confirmar contraseña" type="password" error={passwordForm.formState.errors.confirmarPassword?.message} {...passwordForm.register('confirmarPassword')}/></div><Button type="button" variant="outline" className="mt-4" cargando={guardandoPassword} onClick={passwordForm.handleSubmit(guardarPassword)}>Actualizar contraseña</Button></section><div className="flex justify-end gap-3 border-t border-surface-200 pt-5 dark:border-surface-800"><Button type="button" variant="outline" onClick={() => form.reset(perfil)}>Cancelar</Button><Button type="submit" cargando={guardando}>Guardar cambios</Button></div></form>}
    </Card>
  </div>;
}
