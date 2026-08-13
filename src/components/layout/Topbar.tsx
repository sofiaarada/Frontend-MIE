import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Breadcrumb } from './Breadcrumb';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeStore } from '@/store/themeStore';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export function Topbar() {
  const { tema, alternarTema } = useThemeStore();
  const { setSidebarMobileAbierto } = useUiStore();
  const { session, cerrarSesion } = useAuthStore();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-surface-200 bg-white/80 px-4 backdrop-blur-md dark:border-surface-800 dark:bg-surface-900/80 sm:px-6">
      <button
        onClick={() => setSidebarMobileAbierto(true)}
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <Breadcrumb />
      </div>

      <div className="relative ml-0 hidden max-w-xs flex-1 sm:block lg:ml-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          placeholder="Buscar espacio, activo, ticket..."
          className="focus-ring h-9 w-full rounded-lg border border-surface-200 bg-surface-50 pl-9 pr-3 text-sm text-surface-700 placeholder:text-surface-400 dark:border-surface-800 dark:bg-surface-800/60 dark:text-surface-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 dark:bg-success-500/10 dark:text-success-500 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
          Sistema activo
        </span>

        <button
          onClick={alternarTema}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
        >
          {tema === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <NotificationsDropdown />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuAbierto((a) => !a)}
            className="focus-ring ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <Avatar nombre={session?.usuario.nombre ?? 'Usuario'} size="sm" />
            <div className="hidden text-left leading-tight md:block">
              <p className="text-xs font-semibold text-surface-800 dark:text-surface-100">{session?.usuario.nombre}</p>
              <p className="text-[11px] text-surface-400">{session?.usuario.rol.toLowerCase()}</p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-surface-400 md:block" />
          </button>

          <AnimatePresence>
            {menuAbierto && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-surface-200 bg-white p-1.5 shadow-elevated dark:border-surface-800 dark:bg-surface-900"
              >
                <button className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800">
                  <User className="h-4 w-4" /> Mi perfil
                </button>
                <button
                  onClick={() => {
                    cerrarSesion();
                    navigate('/login');
                  }}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
