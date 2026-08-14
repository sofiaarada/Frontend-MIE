import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'focus-ring h-10 w-full appearance-none rounded-lg border border-surface-200 bg-white pl-3 pr-9 text-sm text-surface-800 transition-colors',
              'dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100',
              error && 'border-danger-500 focus-visible:ring-danger-500',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        </div>
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';