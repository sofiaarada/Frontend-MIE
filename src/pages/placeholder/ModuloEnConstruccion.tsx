import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { navItems } from '@/routes/navigation';

export function ModuloEnConstruccion() {
  const { pathname } = useLocation();
  const item = navItems.find((n) => pathname.startsWith(n.path));

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface-200 bg-white py-24 text-center dark:border-surface-800 dark:bg-surface-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
        <Construction className="h-7 w-7" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-surface-800 dark:text-surface-100">
          {item?.label ?? 'Módulo'} — próxima entrega
        </h2>
        <p className="mt-1 max-w-sm text-sm text-surface-500 dark:text-surface-400">
          Proximamente
        </p>
      </div>
    </div>
  );
}
