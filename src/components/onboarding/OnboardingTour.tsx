import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Search, Bell, SunMoon, UserRound, Compass,
  X, ArrowLeft, ArrowRight, Check, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useTourStore } from '@/store/tourStore';
import { useUiStore } from '@/store/uiStore';

interface PasoObjetivo {
  tipo: 'objetivo';
  selector: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  tono: string;
  lado?: 'abajo' | 'derecha';
}

interface PasoCentrado {
  tipo: 'centro';
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  tono: string;
  detalles?: string[];
  etiquetaSiguiente: string;
}

type Paso = PasoObjetivo | PasoCentrado;

const pasos: Paso[] = [
  {
    tipo: 'centro',
    titulo: 'Bienvenido/a a MIE',
    descripcion: 'Un recorrido de 30 segundos por las partes clave del sistema.',
    icono: Compass,
    tono: 'bg-primary-600 text-white',
    detalles: [
      'Cómo moverte entre módulos',
      'Dónde aparecen las alertas',
      'Ajustes de tu cuenta y tema',
    ],
    etiquetaSiguiente: 'Empezar recorrido',
  },
  {
    tipo: 'objetivo',
    selector: '[data-tour="sidebar"]',
    titulo: 'Navegación principal',
    descripcion: 'Todos los módulos del sistema: espacios, activos, tickets, mantenimiento y más.',
    icono: LayoutDashboard,
    tono: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    lado: 'derecha',
  },
  {
    tipo: 'objetivo',
    selector: '[data-tour="buscador"]',
    titulo: 'Buscador global',
    descripcion: 'Encontrá cualquier espacio, activo u orden de trabajo sin salir de donde estás.',
    icono: Search,
    tono: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  },
  {
    tipo: 'objetivo',
    selector: '[data-tour="notificaciones"]',
    titulo: 'Alertas en tiempo real',
    descripcion: 'Fugas, cortes o inspecciones pendientes te avisan acá, con un punto rojo si hay novedades.',
    icono: Bell,
    tono: 'bg-danger-50 text-danger-500 dark:bg-danger-500/10',
  },
  {
    tipo: 'objetivo',
    selector: '[data-tour="tema"]',
    titulo: 'Modo claro / oscuro',
    descripcion: 'Alterná el tema cuando quieras. MIE recuerda tu preferencia.',
    icono: SunMoon,
    tono: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  },
  {
    tipo: 'objetivo',
    selector: '[data-tour="perfil"]',
    titulo: 'Tu cuenta',
    descripcion: 'Tu perfil y la salida del sistema. Este recorrido queda disponible acá, en el menú.',
    icono: UserRound,
    tono: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  },
  {
    tipo: 'objetivo',
    selector: '[data-tour="asistente"]',
    titulo: 'Tu copiloto con IA',
    descripcion: 'Preguntale en español: estado de un espacio, urgencias, presupuesto. Responde con datos reales del sistema.',
    icono: Sparkles,
    tono: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  },
  {
    tipo: 'centro',
    titulo: 'Listo, eso es lo que importa',
    descripcion: 'El resto se aprende usándolo. Si te perdés, podés repetir este recorrido desde tu menú de perfil.',
    icono: Check,
    tono: 'bg-success-500 text-white',
    etiquetaSiguiente: 'Explorar MIE',
  },
];

const PAD_OBJETIVO = 8;
const VELO = 'rgba(2, 6, 23, 0.72)';
const RECORTE = `0 0 0 9999px ${VELO}`;


function buscarVisible(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

export function OnboardingTour() {
  const abierto = useTourStore((s) => s.abierto);
  const cerrarTour = useTourStore((s) => s.cerrarTour);
  const setSidebarMobileAbierto = useUiStore((s) => s.setSidebarMobileAbierto);

  const [indice, setIndice] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [caja, setCaja] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ top: number; left: number } | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const abrioDrawerRef = useRef(false);

  const paso = pasos[indice];
  const esUltimo = indice === pasos.length - 1;

  
  const medir = useCallback(() => {
    if (!abierto) return;
    const anchoTarjeta = Math.min(440, window.innerWidth - 32);
    const altoTarjeta = tooltipRef.current?.offsetHeight ?? 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (paso.tipo !== 'objetivo') {
      setCaja(null);
      setTooltip({ top: Math.max((vh - altoTarjeta) / 2, 16), left: (vw - anchoTarjeta) / 2 });
      return;
    }

    const el = buscarVisible(paso.selector);
    if (!el) {
      setCaja(null);
      setTooltip({ top: Math.max((vh - altoTarjeta) / 2, 16), left: (vw - anchoTarjeta) / 2 });
      return;
    }

    const r = el.getBoundingClientRect();
    setCaja({
      x: r.left - PAD_OBJETIVO,
      y: r.top - PAD_OBJETIVO,
      w: r.width + PAD_OBJETIVO * 2,
      h: r.height + PAD_OBJETIVO * 2,
    });

    let top: number;
    let left: number;

    if (paso.lado === 'derecha' && r.right + anchoTarjeta + 30 < vw) {
      top = Math.min(Math.max(r.top - 8, 16), vh - altoTarjeta - 16);
      left = r.right + 16;
    } else if (r.bottom + altoTarjeta + 44 < vh) {
      top = r.bottom + 14;
      left = Math.min(Math.max(r.left + r.width / 2 - anchoTarjeta / 2, 12), vw - anchoTarjeta - 12);
    } else if (r.top - altoTarjeta - 30 > 0) {
      top = r.top - altoTarjeta - 14;
      left = Math.min(Math.max(r.left + r.width / 2 - anchoTarjeta / 2, 12), vw - anchoTarjeta - 12);
    } else {
      top = Math.min(Math.max(vh / 2 - altoTarjeta / 2, 16), vh - altoTarjeta - 16);
      left = Math.min(Math.max(r.left + r.width / 2 - anchoTarjeta / 2, 12), vw - anchoTarjeta - 12);
    }
    setTooltip({ top, left });
  }, [abierto, paso]);

  
  useEffect(() => {
    if (!abierto) return;

    
    if (paso.tipo === 'objetivo' && paso.selector === '[data-tour="sidebar"]') {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        setSidebarMobileAbierto(true);
        abrioDrawerRef.current = true;
      }
    }

    if (paso.tipo === 'objetivo') {
      const el = buscarVisible(paso.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight || r.left < 0 || r.right > window.innerWidth) {
          el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        }
      }
    }

    const raf = requestAnimationFrame(medir);
    const t = setTimeout(medir, 380);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [abierto, indice, medir, paso, setSidebarMobileAbierto]);

  
  useEffect(() => {
    if (!abierto) return;
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, true);
    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir, true);
    };
  }, [abierto, medir]);


  useEffect(() => {
    if (!abierto && abrioDrawerRef.current) {
      setSidebarMobileAbierto(false);
      abrioDrawerRef.current = false;
    }
  }, [abierto, setSidebarMobileAbierto]);

  const irA = useCallback(
    (siguiente: number) => {
      setDireccion(siguiente > indice ? 1 : -1);
      setIndice(siguiente);
    },
    [indice]
  );

  const finalizar = useCallback(
    (completo: boolean) => {
      cerrarTour();
      setIndice(0);
      setDireccion(1);
      if (completo) toast.success('Ya podés explorar el sistema.');
    },
    [cerrarTour]
  );

  // Teclado: Esc omite, flechas navegan.
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finalizar(false);
      if (e.key === 'ArrowRight' && !esUltimo) irA(indice + 1);
      if (e.key === 'ArrowLeft' && indice > 0) irA(indice - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [abierto, indice, esUltimo, irA, finalizar]);

  if (!abierto) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Tutorial de bienvenida" className="fixed inset-0 z-[70]">
      {/* Recorte iluminado sobre el objetivo, o velo completo en pasos centrados */}
      {caja ? (
        <motion.div
          animate={{ left: caja.x, top: caja.y, width: caja.w, height: caja.h }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="pointer-events-auto absolute rounded-xl shadow-[0_0_28px_rgba(37,99,235,0.45)] ring-2 ring-primary-400"
          style={{ boxShadow: RECORTE }}
        />
      ) : (
        <div className="pointer-events-auto absolute inset-0" style={{ background: VELO }} />
      )}

      {/* Pulso de atención sobre el objetivo */}
      {paso.tipo === 'objetivo' && caja && (
        <motion.span
          aria-hidden
          className="absolute rounded-xl border-2 border-primary-400"
          style={{ left: caja.x, top: caja.y, width: caja.w, height: caja.h }}
          animate={{ opacity: [0, 0.9, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      <motion.div
        ref={tooltipRef}
        key={indice}
        initial={{ opacity: 0, x: direccion * 24 }}
        animate={{ opacity: tooltip ? 1 : 0, x: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="absolute max-h-[calc(100svh-24px)] w-[min(440px,calc(100vw-32px))] overflow-y-auto overscroll-contain rounded-2xl border border-surface-200 bg-white shadow-elevated dark:border-surface-800 dark:bg-surface-900"
        style={tooltip ? { top: tooltip.top, left: tooltip.left } : undefined}
      >
        {/* cinta de marca */}
        <div className="h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-success-500" />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', paso.tono)}>
              <paso.icono className="h-6 w-6" />
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                Paso {indice + 1} de {pasos.length}
              </span>
              <button
                type="button"
                onClick={() => finalizar(false)}
                className="focus-ring -mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
                aria-label="Omitir tutorial"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h3 className="mt-4 font-display text-xl font-bold leading-snug text-surface-900 dark:text-white">
            {paso.titulo}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-surface-500 dark:text-surface-300">{paso.descripcion}</p>

          {'detalles' in paso && paso.detalles && (
            <ul className="mt-3 space-y-1.5">
              {paso.detalles.map((d) => (
                <li key={d} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                  <Check className="h-4 w-4 shrink-0 text-success-500" />
                  {d}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {pasos.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 rounded-full transition-all duration-200',
                    i === indice ? 'w-6 bg-primary-600 dark:bg-primary-400' : 'w-2 bg-surface-200 dark:bg-surface-700'
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {indice > 0 && (
                <button
                  type="button"
                  onClick={() => irA(indice - 1)}
                  className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 text-surface-500 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
                  aria-label="Paso anterior"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => (esUltimo ? finalizar(true) : irA(indice + 1))}
                className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
              >
                {'etiquetaSiguiente' in paso ? paso.etiquetaSiguiente : esUltimo ? 'Finalizar' : 'Siguiente'}
                {esUltimo ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {indice === 0 && (
            <button
              type="button"
              onClick={() => finalizar(false)}
              className="focus-ring mt-3 block w-full text-center text-xs font-medium text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              Omitir, ya conozco el sistema
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
