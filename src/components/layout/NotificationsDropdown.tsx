import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Info, Send, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import type { Notificacion } from '@/types';
import { cn } from '@/utils/cn';
import { formatearFecha } from '@/utils/format';
import { toast } from 'sonner';

const iconoPorTipo: Record<string, typeof AlertTriangle> = { Info: Info, Advertencia: AlertTriangle, Critico: AlertTriangle };
const colorPorTipo: Record<string, string> = {
  Info: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10',
  Advertencia: 'text-warning-500 bg-warning-50 dark:bg-warning-500/10',
  Critico: 'text-danger-500 bg-danger-50 dark:bg-danger-500/10',
};

export function NotificationsDropdown() {
  const [abierto, setAbierto] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Notificacion | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: notificaciones = [] } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: notificationService.listar,
  });
  const noLeidas = notificaciones.filter((n) => !n.leido).length;
  const marcarLeida = async (id: string) => { try { await notificationService.marcarLeida(id); queryClient.invalidateQueries({ queryKey: ['notificaciones'] }); } catch { toast.error('No se pudo actualizar la notificación.'); } };
  const abrirDetalle = async (n: Notificacion) => {
    setSeleccionada(n);
    if (!n.leido) await marcarLeida(n.id);
  };
  const enviarAviso = async () => { if (mensaje.trim().length < 5) { toast.error('Escribí un aviso de al menos 5 caracteres.'); return; } setEnviando(true); try { await notificationService.avisarModerador(mensaje); setMensaje(''); toast.success('Aviso enviado a moderación.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo enviar el aviso.'); } finally { setEnviando(false); } };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setAbierto(false); setSeleccionada(null); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        data-tour="notificaciones"
        onClick={() => { setAbierto((a) => !a); setSeleccionada(null); }}
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
      >
        <Bell className="h-[18px] w-[18px]" />
        {noLeidas > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-surface-900" />
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-elevated dark:border-surface-800 dark:bg-surface-900"
          >
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 dark:border-surface-800">
              {seleccionada ? (
                <button onClick={() => setSeleccionada(null)} className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Volver
                </button>
              ) : (
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">Notificaciones</p>
              )}
              {!seleccionada && noLeidas > 0 && <button onClick={async () => { await notificationService.marcarTodasLeidas(); queryClient.invalidateQueries({ queryKey: ['notificaciones'] }); }} className="text-xs text-primary-600 hover:underline">Marcar todas leídas</button>}
            </div>
            {seleccionada ? (
              <div className="px-4 py-3">
                {(() => {
                  const Icono = iconoPorTipo[seleccionada.tipo ?? ''] ?? Info;
                  return (
                    <div className="mb-3 flex items-start gap-3">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorPorTipo[seleccionada.tipo ?? ''] ?? 'text-primary-500 bg-primary-50 dark:bg-primary-500/10')}>
                        <Icono className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">{seleccionada.titulo}</p>
                        <p className="rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-medium capitalize text-surface-500 dark:bg-surface-800 dark:text-surface-400">{seleccionada.tipo}</p>
                      </div>
                    </div>
                  );
                })()}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-surface-600 dark:text-surface-300">{seleccionada.descripcion}</p>
                <p className="mt-3 text-xs text-surface-400 dark:text-surface-500">{formatearFecha(seleccionada.fecha)}</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-surface-400">No tenés notificaciones.</p>
                ) : notificaciones.map((n) => {
                  const Icono = iconoPorTipo[n.tipo ?? ''] ?? Info;
                  return (
                    <button type="button" onClick={() => abrirDetalle(n)} key={n.id} className={cn('flex w-full gap-3 px-4 py-3 text-left', !n.leido && 'bg-primary-50/40 dark:bg-primary-500/5')}>
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', colorPorTipo[n.tipo ?? ''] ?? 'text-primary-500 bg-primary-50 dark:bg-primary-500/10')}>
                        <Icono className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{n.titulo}</p>
                        <p className="truncate text-xs text-surface-500 dark:text-surface-400">{n.descripcion}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="border-t border-surface-100 p-3 dark:border-surface-800"><label className="mb-1 block text-xs font-medium text-surface-600 dark:text-surface-300">Avisar a moderación</label><div className="flex gap-2"><input value={mensaje} maxLength={1000} onChange={(e) => setMensaje(e.target.value)} placeholder="Describe el problema…" className="min-w-0 flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs dark:border-surface-700 dark:bg-surface-900"/><button type="button" onClick={enviarAviso} disabled={enviando} aria-label="Enviar aviso" className="rounded-lg bg-primary-600 p-2 text-white disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button></div></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
