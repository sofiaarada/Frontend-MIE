import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ComboboxOpcion {
  id: string;
  etiqueta: string;
  detalle?: string;
}

interface ComboboxBusquedaProps {
  label?: string;
  error?: string;
  placeholder?: string;
  opciones: ComboboxOpcion[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  vacioMensaje?: string;
}

export function ComboboxBusqueda({
  label,
  error,
  placeholder = 'Buscar y seleccionar…',
  opciones,
  value,
  onChange,
  disabled,
  vacioMensaje = 'Sin resultados.',
}: ComboboxBusquedaProps) {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState('');
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const seleccion = useMemo(() => opciones.find((o) => o.id === value), [opciones, value]);

  const filtradas = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return opciones;
    return opciones.filter(
      (o) => o.etiqueta.toLowerCase().includes(t) || o.detalle?.toLowerCase().includes(t)
    );
  }, [opciones, query]);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);

  const alternar = () => {
    if (disabled) return;
    const proximo = !abierto;
    setQuery('');
    setAbierto(proximo);
    if (proximo) requestAnimationFrame(() => inputRef.current?.focus());
  };

  const elegir = (id: string) => {
    onChange(id);
    setAbierto(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">{label}</label>
      )}
      <div ref={contenedorRef} className="relative">
        <button
          type="button"
          onClick={alternar}
          disabled={disabled}
          className={cn(
            'focus-ring flex h-10 w-full items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 text-left text-sm transition-colors',
            'dark:border-surface-700 dark:bg-surface-900',
            disabled && 'cursor-not-allowed opacity-60',
            error && !abierto && 'border-danger-500 focus-visible:ring-danger-500'
          )}
        >
          <span className={cn('flex-1 truncate', seleccion ? 'text-surface-800 dark:text-surface-100' : 'text-surface-400')}>
            {seleccion ? seleccion.etiqueta : placeholder}
          </span>
          {seleccion && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Limpiar selección"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="focus-ring rounded p-0.5 text-surface-400 hover:text-danger-500"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <Search className="pointer-events-none h-4 w-4 shrink-0 text-surface-400" />
        </button>

        {abierto && (
          <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-elevated dark:border-surface-700 dark:bg-surface-900">
            <div className="relative border-b border-surface-100 p-2 dark:border-surface-800">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí para filtrar…"
                className="focus-ring h-9 w-full rounded-lg border border-transparent bg-surface-100 pl-9 pr-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-300 focus:bg-white dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500 dark:focus:bg-surface-700"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto p-1.5">
              {filtradas.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-surface-400">{vacioMensaje}</li>
              ) : (
                filtradas.map((o) => {
                  const activa = o.id === value;
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => elegir(o.id)}
                        className={cn(
                          'focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left',
                          activa ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/60'
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate text-sm', activa ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-surface-700 dark:text-surface-200')}>
                            {o.etiqueta}
                          </span>
                          {o.detalle && <span className="block truncate text-xs text-surface-400">{o.detalle}</span>}
                        </span>
                        {activa && <Check className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}