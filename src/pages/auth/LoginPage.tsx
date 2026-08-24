import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, MapPin, ClipboardList, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { mockUsuarios } from '@/services/mock/mockData';

const schema = z.object({
  correo: z.string().min(1, 'Ingresá tu correo institucional.').email('Correo inválido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
  recordarme: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const destacados = [
  { icono: Building2, texto: '48 espacios monitoreados' },
  { icono: ClipboardList, texto: 'Órdenes de trabajo en tiempo real' },
  { icono: MapPin, texto: 'Reportes y análisis automatizados' },
];

export function LoginPage() {
  const [verPassword, setVerPassword] = useState(false);
  const { iniciarSesion, cargando } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { correo: '', password: '', recordarme: true },
  });

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

  const usarCuenta = (correo: string) => {
    setValue('correo', correo);
    setValue('password', 'demo1234');
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Panel izquierdo — identidad de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-950 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.18),transparent_40%)]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-soft">
            <img src='./public/logo_mie.png' alt="MIE" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-none">Monitoreo de Infraestructura Educacional</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-md"
        >
          <h1 className="font-display text-4xl font-bold leading-tight">
            Gestión inteligente de infraestructura educativa
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-surface-300">
            Registro, seguimiento y evaluación del estado de espacios, mobiliario
            y recursos físicos en instituciones educativas.
          </p>
          <ul className="mt-8 space-y-3">
            {destacados.map((d, i) => (
              <motion.li
                key={d.texto}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-surface-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <d.icono className="h-4 w-4" />
                </span>
                {d.texto}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-surface-500">
          © 2026 MIE - Monitoreo de Infraestructura Educacional
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center bg-surface-50 px-6 py-12 dark:bg-surface-950 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="font-display text-sm font-bold text-surface-900 dark:text-white">MIE Monitor</p>
          </div>

          <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Ingresá con tu cuenta institucional.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="usuario@infraedu.ar"
              icono={<Mail className="h-4 w-4" />}
              error={errors.correo?.message}
              {...register('correo')}
            />
            <Input
              label="Contraseña"
              type={verPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icono={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              accion={
                <button type="button" onClick={() => setVerPassword((v) => !v)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                  {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                <input type="checkbox" className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" {...register('recordarme')} />
                Recordarme
              </label>
              <button type="button" className="font-medium text-primary-600 hover:text-primary-700">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" cargando={cargando}>
              Ingresar al sistema
              {!cargando && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-7">
            <div className="flex items-center gap-3 text-xs text-surface-400">
              <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
              Cuentas de demostración
              <div className="h-px flex-1 bg-surface-200 dark:bg-surface-800" />
            </div>
            <div className="mt-3 space-y-2">
              {mockUsuarios.slice(0, 2).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => usarCuenta(u.correo)}
                  className="focus-ring flex w-full items-center gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left hover:bg-white dark:border-surface-800 dark:hover:bg-surface-900"
                >
                  <Avatar nombre={u.nombre} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{u.nombre}</p>
                    <p className="truncate text-xs text-surface-400">{u.correo}</p>
                  </div>
                  <span className="text-xs font-medium text-primary-600">Usar</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
