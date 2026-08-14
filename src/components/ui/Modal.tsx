import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const tamanos = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Modal({ abierto, onCerrar, titulo, descripcion, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCerrar}
            className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-elevated dark:bg-surface-900',
              tamanos[size]
            )}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-surface-100 px-6 py-4 dark:border-surface-800">
              <div>
                <h2 className="font-display text-base font-semibold text-surface-900 dark:text-white">{titulo}</h2>
                {descripcion && <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{descripcion}</p>}
              </div>
              <button
                onClick={onCerrar}
                className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-surface-100 px-6 py-4 dark:border-surface-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}