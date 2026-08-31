import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

const schema = z.object({
  correo: z.string().min(1, 'Ingresá tu correo institucional.').email('Correo inválido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
  recordarme: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const [verPassword, setVerPassword] = useState(false);
  const { iniciarSesion, cargando } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem('mie-welcome-complete')) navigate('/', { replace: true });
  }, [navigate]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { correo: '', password: '', recordarme: true },
  });

  const recuperarPassword = async () => {
    const correo = getValues('correo');
    if (!correo) { toast.error('Escribí primero tu correo institucional.'); return; }
    try { await authService.recuperarPassword(correo); toast.success('Si el correo existe, se registró la solicitud de recuperación.'); }
    catch { toast.error('No se pudo registrar la solicitud de recuperación.'); }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await iniciarSesion(values.correo, values.password, values.recordarme);
      toast.success('Sesión iniciada correctamente.');
      const destino = (location.state as { desde?: string } | null)?.desde ?? '/dashboard';
      navigate(destino, { replace: true });
    } catch {
      toast.error('No pudimos iniciar sesión. Verificá tus datos.');
    }
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-surface-50 px-4 py-10 dark:bg-surface-950 sm:px-6">
      
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        style={{ backgroundImage: "url('/img/grid-blueprint.svg')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.08),transparent_45%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl border border-surface-200/80 bg-white shadow-elevated dark:border-surface-800 dark:bg-surface-900">
          <div aria-hidden className="h-1 w-full bg-gradient-to-r from-primary-600 via-primary-500 to-success-500" />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl shadow-soft ring-1 ring-surface-200 dark:ring-surface-700">
                <img src="/logo_mie.png" alt="Logo MIE" className="h-full w-full object-cover" />
              </span>
              <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
                Iniciar sesión
              </h1>
              <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
                Ingresá con tu cuenta institucional.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="usuario@infraedu.ar"
                icono={<Mail className="h-4 w-4" />}
                error={errors.correo?.message}
                className="h-11"
                {...register('correo')}
              />
              <Input
                label="Contraseña"
                type={verPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icono={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                className="h-11 pr-11"
                accion={
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-200"
                  >
                    {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register('password')}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-surface-500 select-none dark:text-surface-400">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                    {...register('recordarme')}
                  />
                  Recordarme
                </label>
                <button type="button" onClick={recuperarPassword} className="font-medium text-primary-600 transition-colors hover:text-primary-700 dark:hover:text-primary-400">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button type="submit" size="lg" className="w-full" cargando={cargando}>
                Ingresar al sistema
                {!cargando && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <p className="border-t border-surface-100 py-4 text-center text-xs text-surface-400 dark:border-surface-800">
            © 2026 MIE — Monitoreo de Infraestructura Educacional
          </p>
        </div>

        <Link
          to="/"
          className="focus-ring mx-auto mt-6 flex w-fit items-center gap-1.5 rounded-lg text-sm font-medium text-surface-500 transition-colors hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
