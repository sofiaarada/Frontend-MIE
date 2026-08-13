import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icono?: ReactNode;
  accion?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icono, accion, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">
            {label}
          </label>
        )}
        <div className="relative">
          {icono && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              {icono}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'focus-ring h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm text-surface-800 placeholder:text-surface-400 transition-colors',
              'dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100',
              icono && 'pl-10',
              accion && 'pr-10',
              error && 'border-danger-500 focus-visible:ring-danger-500',
              className
            )}
            {...props}
          />
          {accion && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {accion}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
