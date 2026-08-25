import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles, X, SendHorizontal, Wrench, Ticket as TicketIcon,
  CalendarDays, Wallet, TrendingUp, Building2, AlertTriangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { consultar } from '@/services/asistenteService';
import type { RespuestaAsistente } from '@/services/asistenteService';
import type { EstadoInfraestructura, Prioridad } from '@/types';
import { formatearFecha, formatearMoneda } from '@/utils/format';

const ETIQUETA_ESTADO: Record<EstadoInfraestructura, string> = {
  BUENO: 'Bueno',
  REGULAR: 'Regular',
  DETERIORADO: 'Deteriorado',
  CRITICO: 'Crítico',
};

const CLASE_ESTADO: Record<EstadoInfraestructura, string> = {
  BUENO: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
  REGULAR: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
  DETERIORADO: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  CRITICO: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
};

const CLASE_PRIORIDAD: Record<Prioridad, string> = {
  URGENTE: 'bg-danger-500 text-white',
  ALTA: 'bg-warning-500 text-white',
  MEDIA: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  BAJA: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-300',
};

const SUGERENCIAS = [
  '¿Qué hay urgente?',
  '¿Cómo está el Lab. Ciencias?',
  '¿Qué mantenimiento hay esta semana?',
  '¿Dónde conviene invertir primero?',
  'Resumen general',
];

interface Mensaje {
  id: number;
  rol: 'user' | 'bot';
  pregunta?: string;
  respuesta?: RespuestaAsistente;
}

let proximoId = 1;

function TituloTarjeta({ icono: Icono, children }: { icono: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
        <Icono className="h-4 w-4" />
      </span>
      <p className="font-display text-sm font-bold text-surface-900 dark:text-white">{children}</p>
    </div>
  );
}

function TarjetaRespuesta({ respuesta }: { respuesta: RespuestaAsistente }) {
  switch (respuesta.tipo) {
    case 'texto':
      return <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-200">{respuesta.texto}</p>;

    case 'espacio': {
      const { espacio, inspeccion, ticketsAbiertos } = respuesta;
      return (
        <div>
          <TituloTarjeta icono={Building2}>{espacio.nombre}</TituloTarjeta>
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', CLASE_ESTADO[espacio.estado])}>
              {ETIQUETA_ESTADO[espacio.estado]}
            </span>
            <span className="text-xs text-surface-400">{espacio.codigo} · {espacio.piso}</span>
          </div>
          {inspeccion ? (
            <div className="mt-2.5 rounded-xl bg-surface-50 p-2.5 dark:bg-surface-800/60">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-surface-400">Última inspección</span>
                <span
                  className={cn(
                    'font-display text-lg font-bold',
                    inspeccion.puntajeGlobal >= 70 ? 'text-success-600' : inspeccion.puntajeGlobal >= 45 ? 'text-warning-600' : 'text-danger-500'
                  )}
                >
                  {inspeccion.puntajeGlobal} pts
                </span>
              </div>
              <p className="mt-0.5 text-xs text-surface-400">
                {formatearFecha(inspeccion.fecha)} · {inspeccion.itemsBuenos} ítems bien · {inspeccion.observaciones} observaciones
              </p>
            </div>
          ) : (
            <p className="mt-2.5 text-xs text-surface-400">Sin inspecciones registradas todavía.</p>
          )}
          {ticketsAbiertos.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              {ticketsAbiertos.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-xs">
                  <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase', CLASE_PRIORIDAD[t.prioridad])}>
                    {t.prioridad}
                  </span>
                  <span className="truncate text-surface-500 dark:text-surface-300">{t.titulo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'tickets':
      return (
        <div>
          <TituloTarjeta icono={TicketIcon}>{respuesta.titulo}</TituloTarjeta>
          {respuesta.tickets.length === 0 ? (
            <p className="text-sm text-surface-500 dark:text-surface-300">Nada urgente por ahora. Todo tranquilo.</p>
          ) : (
            <ul className="space-y-2">
              {respuesta.tickets.map((t) => (
                <li key={t.id} className="rounded-xl bg-surface-50 p-2.5 dark:bg-surface-800/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{t.titulo}</span>
                    <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase', CLASE_PRIORIDAD[t.prioridad])}>
                      {t.prioridad}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-surface-400">{t.espacioNombre} · vence {formatearFecha(t.fechaVencimiento)}</p>
                </li>
              ))}
            </ul>
          )}
          {respuesta.nota && <p className="mt-2 text-xs text-surface-400">{respuesta.nota}</p>}
        </div>
      );

    case 'agenda':
      return (
        <div>
          <TituloTarjeta icono={CalendarDays}>{respuesta.titulo}</TituloTarjeta>
          {respuesta.items.length === 0 ? (
            <p className="text-sm text-surface-500 dark:text-surface-300">No hay mantenimientos programados a la vista.</p>
          ) : (
            <ul className="space-y-2">
              {respuesta.items.map((m) => (
                <li key={m.id} className="flex items-start gap-2.5 rounded-xl bg-surface-50 p-2.5 dark:bg-surface-800/60">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{m.titulo}</p>
                    <p className="text-xs text-surface-400">
                      {formatearFecha(m.fechaProgramada)} · {m.responsable} · {formatearMoneda(m.costo)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'presupuesto': {
      const maximo = Math.max(...respuesta.meses.map((m) => m.valor));
      return (
        <div>
          <TituloTarjeta icono={Wallet}>Presupuesto de mantenimiento</TituloTarjeta>
          <p className="font-display text-2xl font-bold text-surface-900 dark:text-white">{formatearMoneda(respuesta.total)}</p>
          <p className="text-xs text-surface-400">Acumulado del ciclo · {respuesta.nota}</p>
          <div className="mt-3 flex h-20 items-end gap-1.5">
            {respuesta.meses.map((m) => (
              <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((m.valor / maximo) * 100, 6)}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full rounded-t-md bg-primary-500/80"
                />
                <span className="text-[10px] text-surface-400">{m.mes}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'ranking':
      return (
        <div>
          <TituloTarjeta icono={TrendingUp}>{respuesta.titulo}</TituloTarjeta>
          <ol className="space-y-2">
            {respuesta.items.map((item, i) => (
              <li key={item.nombre} className="flex items-center gap-2.5 rounded-xl bg-surface-50 p-2.5 dark:bg-surface-800/60">
                <span className="font-display w-5 text-center text-sm font-bold text-surface-300 dark:text-surface-500">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-100">{item.nombre}</p>
                  <p className="text-xs text-surface-400">
                    {item.puntaje} pts{item.problemas > 0 ? ` · ${item.problemas} problemas activos` : ''}
                  </p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', CLASE_ESTADO[item.estado])}>
                  {ETIQUETA_ESTADO[item.estado]}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-surface-400">{respuesta.nota}</p>
        </div>
      );

    case 'resumen':
      return (
        <div>
          <TituloTarjeta icono={AlertTriangle}>Panorama general</TituloTarjeta>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Espacios', String(respuesta.kpi.espaciosTotales)],
              ['Activos', respuesta.kpi.activosRegistrados.toLocaleString('es-AR')],
              ['OT abiertas', String(respuesta.kpi.ticketsAbiertos)],
              ['Índice global', `${respuesta.kpi.indiceEstadoGlobal}%`],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="rounded-xl bg-surface-50 p-2.5 dark:bg-surface-800/60">
                <p className="text-xs text-surface-400">{etiqueta}</p>
                <p className="font-display text-lg font-bold text-surface-900 dark:text-white">{valor}</p>
              </div>
            ))}
          </div>
          {respuesta.alertasNoLeidas > 0 && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-warning-600 dark:text-warning-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              Tenés {respuesta.alertasNoLeidas} alertas sin leer.
            </p>
          )}
        </div>
      );
  }
}

export function AsistenteFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [pensando, setPensando] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 0,
      rol: 'bot',
      respuesta: {
        tipo: 'texto',
        texto: '¡Hola! Soy el asistente de MIE. Preguntame por tus espacios, lo urgente o el presupuesto.',
        sugerir: true,
      },
    },
  ]);
  const cuerpoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [abierto]);

  useEffect(() => {
    const el = cuerpoRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [mensajes, pensando, abierto]);

  const enviar = async (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || pensando) return;
    setEntrada('');
    setMensajes((ms) => [...ms, { id: proximoId++, rol: 'user', pregunta: limpio }]);
    setPensando(true);
    try {
      const respuesta = await consultar(limpio);
      setMensajes((ms) => [...ms, { id: proximoId++, rol: 'bot', respuesta }]);
    } catch {
      setMensajes((ms) => [
        ...ms,
        { id: proximoId++, rol: 'bot', respuesta: { tipo: 'texto', texto: 'Tuve un problema consultando los datos. Probá de nuevo.' } },
      ]);
    } finally {
      setPensando(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!abierto && (
          <motion.button
            data-tour="asistente"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAbierto(true)}
            aria-label="Abrir asistente MIE"
            className="focus-ring fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-elevated"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-primary-500 opacity-15" />
            <Sparkles className="relative h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {abierto && (
          <motion.aside
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-[65] flex w-[min(420px,100vw)] flex-col border-l border-surface-200 bg-surface-50 shadow-elevated dark:border-surface-800 dark:bg-surface-950"
            role="dialog"
            aria-label="Asistente MIE"
          >
            {/* Encabezado con identidad MIE */}
            <header className="relative shrink-0 overflow-hidden bg-surface-950 px-4 pb-4 pt-4">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{ backgroundImage: "url('/img/grid-blueprint.svg')" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.35),transparent_60%)]"
              />
              <div className="relative flex items-center gap-3">
                <img src="/logo_mie.png" alt="" className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/20" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-bold text-white">Asistente MIE</p>
                  <p className="text-xs text-surface-300">Consultas sobre tu institución, en español</p>
                </div>
                <button
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar asistente"
                  className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-surface-300 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Conversación */}
            <div ref={cuerpoRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {mensajes.map((m) =>
                m.rol === 'user' ? (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary-600 px-3.5 py-2 text-sm text-white shadow-soft"
                  >
                    {m.pregunta}
                  </motion.div>
                ) : (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[95%] space-y-2.5">
                    <div className="rounded-2xl rounded-tl-md border border-surface-200 bg-white p-3.5 shadow-card dark:border-surface-800 dark:bg-surface-900">
                      {m.respuesta && <TarjetaRespuesta respuesta={m.respuesta} />}
                    </div>
                    {m.respuesta?.tipo === 'texto' && m.respuesta.sugerir && (
                      <div className="flex flex-wrap gap-1.5">
                        {SUGERENCIAS.map((s) => (
                          <button
                            key={s}
                            onClick={() => enviar(s)}
                            className="focus-ring rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-50 dark:border-primary-500/30 dark:bg-surface-900 dark:text-primary-300 dark:hover:bg-primary-500/10"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              )}

              {pensando && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 px-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                      className="h-2 w-2 rounded-full bg-primary-400"
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Entrada */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar(entrada);
              }}
              className="flex shrink-0 items-center gap-2 border-t border-surface-200 bg-white p-3 dark:border-surface-800 dark:bg-surface-900"
            >
              <input
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Preguntale algo al sistema..."
                className="focus-ring h-11 min-w-0 flex-1 rounded-xl border border-surface-200 bg-surface-50 px-3.5 text-sm text-surface-700 placeholder:text-surface-400 dark:border-surface-700 dark:bg-surface-800/60 dark:text-surface-200"
              />
              <button
                type="submit"
                disabled={!entrada.trim() || pensando}
                aria-label="Enviar consulta"
                className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft transition-colors hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-40"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
