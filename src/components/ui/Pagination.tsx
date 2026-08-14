import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-surface-100 px-1 pt-4 dark:border-surface-800">
      <p className="text-xs text-surface-500 dark:text-surface-400">
        Mostrando <span className="font-medium text-surface-700 dark:text-surface-200">{desde}-{hasta}</span> de{' '}
        <span className="font-medium text-surface-700 dark:text-surface-200">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 disabled:opacity-40 disabled:pointer-events-none dark:text-surface-400 dark:hover:bg-surface-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={cn(
              'focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium',
              n === page
                ? 'bg-primary-600 text-white'
                : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
            )}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 disabled:opacity-40 disabled:pointer-events-none dark:text-surface-400 dark:hover:bg-surface-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}