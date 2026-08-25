import { NavLink } from 'react-router-dom';
import { ChevronsLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '@/routes/navigation';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const { sidebarColapsado, alternarSidebar, sidebarMobileAbierto, setSidebarMobileAbierto } = useUiStore();

  const contenido = (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center gap-2.5 px-4', sidebarColapsado && 'justify-center px-0')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-soft">
          <img src="/logo_mie.png" alt="MIE logo" className="h-full w-full object-cover" />
        </div>
        <AnimatePresence>
          {!sidebarColapsado && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="font-display text-sm font-bold leading-none text-surface-900 dark:text-white">MIE</p>
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav data-tour="sidebar" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarMobileAbierto(false)}
            className={({ isActive }) =>
              cn(
                'focus-ring group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-surface-500 hover:bg-surface-100 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100',
                sidebarColapsado && 'justify-center px-0'
              )
            }
            title={sidebarColapsado ? item.label : undefined}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!sidebarColapsado && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {!!item.badge && (
                  <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={alternarSidebar}
        className="focus-ring m-3 hidden items-center justify-center gap-2 rounded-lg border border-surface-200 py-2 text-xs font-medium text-surface-500 hover:bg-surface-100 dark:border-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 lg:flex"
      >
        <ChevronsLeft className={cn('h-4 w-4 transition-transform', sidebarColapsado && 'rotate-180')} />
        {!sidebarColapsado && 'Cerrar'}
      </button>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside
        className={cn(
          'sticky top-0 hidden h-svh shrink-0 border-r border-surface-200 bg-white transition-[width] duration-200 dark:border-surface-800 dark:bg-surface-900 lg:block',
          sidebarColapsado ? 'w-[76px]' : 'w-64'
        )}
      >
        {contenido}
      </aside>

      
      <AnimatePresence>
        {sidebarMobileAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarMobileAbierto(false)}
              className="fixed inset-0 z-40 bg-surface-900/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 lg:hidden"
            >
              {contenido}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
