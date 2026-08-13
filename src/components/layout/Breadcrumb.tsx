import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { navItems } from '@/routes/navigation';

export function Breadcrumb() {
  const { pathname } = useLocation();
  const actual = navItems.find((item) => pathname.startsWith(item.path));

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/dashboard" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
        MIE
      </Link>
      {actual && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-surface-300 dark:text-surface-600" />
          <span className="font-medium text-surface-700 dark:text-surface-200">{actual.label}</span>
        </>
      )}
    </nav>
  );
}
