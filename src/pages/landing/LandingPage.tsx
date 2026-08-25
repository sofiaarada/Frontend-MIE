import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, Boxes, Ticket as TicketIcon, Wrench,
  ClipboardCheck, BarChart3, Mail, Phone, MapPin,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const revelar = {
  oculto: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Textura de plano arquitectónico */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
        style={{ backgroundImage: "url('/img/grid-blueprint.svg')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(34,197,94,0.07),transparent_45%)]"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-0px)] max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <div>
          <motion.div initial="oculto" animate="visible" custom={0} variants={revelar}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              Plataforma de gestión institucional
            </span>
          </motion.div>

          <motion.h1
            initial="oculto"
            animate="visible"
            custom={1}
            variants={revelar}
            className="mt-6 font-display text-4xl font-bold leading-[1.06] tracking-tight text-surface-900 sm:text-5xl xl:text-6xl dark:text-white"
          >
            Toda tu infraestructura educativa,{' '}
            <span className="relative inline-block text-primary-600 dark:text-primary-400">
              bajo control
              <svg
                aria-hidden
                viewBox="0 0 220 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-2.5 w-full text-primary-300 dark:text-primary-500/70"
              >
                <path d="M3 9 C 60 2, 160 2, 217 7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial="oculto"
            animate="visible"
            custom={2}
            variants={revelar}
            className="mt-6 max-w-xl text-base leading-relaxed text-surface-500 sm:text-lg dark:text-surface-300"
          >
            MIE registra, sigue y evalúa el estado de espacios, mobiliario y equipamiento
            de tu institución, para que cada decisión de mantenimiento se apoye en datos.
          </motion.p>

          <motion.div
            initial="oculto"
            animate="visible"
            custom={3}
            variants={revelar}
            className="mt-8 flex flex-wrap items-center gap-y-4"
          >
            <Link
              to="/login"
              className="focus-ring group inline-flex h-13 items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-elevated transition-all hover:bg-primary-700 hover:shadow-lg"
            >
              Comenzar
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.dl
            initial="oculto"
            animate="visible"
            custom={4}
            variants={revelar}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-surface-400 dark:text-surface-400"
          >
            {[
              ['48', 'espacios monitoreados'],
              ['1.247', 'activos registrados'],
              ['74%', 'índice global del ciclo'],
            ].map(([valor, etiqueta]) => (
              <div key={etiqueta} className="flex items-baseline gap-2">
                <dt className="font-display text-xl font-bold text-surface-800 dark:text-surface-100">{valor}</dt>
                <dd>{etiqueta}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-3 -z-10 rotate-1 rounded-[28px] border-2 border-dashed border-primary-200 dark:border-primary-500/25"
          />
          <div className="overflow-hidden rounded-3xl shadow-elevated ring-1 ring-surface-200 dark:ring-surface-800">
            <img
              src="/img/hero-mie.svg"
              alt="Campus escolar con capa de monitoreo digital de MIE"
              className="aspect-[16/10] w-full object-cover"
              width="1600"
              height="1000"
            />
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 top-8 hidden rounded-xl border border-surface-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:block dark:border-surface-700 dark:bg-surface-900/95"
          >
            <p className="text-xs font-medium text-surface-400">Índice de estado</p>
            <p className="font-display text-xl font-bold text-success-600">74% <span className="text-xs font-medium text-surface-400">del ciclo</span></p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute -bottom-5 -right-3 hidden rounded-xl border border-surface-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:block dark:border-surface-700 dark:bg-surface-900/95"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-surface-400">
              <span className="h-1.5 w-1.5 rounded-full bg-danger-500" /> Baños PB · Crítico
            </p>
            <p className="font-display text-sm font-bold text-surface-800 dark:text-surface-100">OT asignada en 4 min</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const modulos = [
  {
    icono: Building2,
    nombre: 'Espacios',
    descripcion: 'Inventariá aulas, laboratorios y áreas comunes con su estado de conservación siempre actualizado.',
    tile: 'bg-primary-50 text-primary-600 ring-1 ring-primary-200/70 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-400/25',
    activo: 'group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600 dark:group-hover:bg-primary-500 dark:group-hover:ring-primary-500',
  },
  {
    icono: Boxes,
    nombre: 'Activos',
    descripcion: 'Registrá mobiliario y equipamiento con responsable, valor y historial completo por espacio.',
    tile: 'bg-success-50 text-success-700 ring-1 ring-success-200/70 dark:bg-success-500/10 dark:text-success-400 dark:ring-success-400/25',
    activo: 'group-hover:bg-success-600 group-hover:text-white group-hover:ring-success-600 dark:group-hover:bg-success-500 dark:group-hover:ring-success-500',
  },
  {
    icono: TicketIcon,
    nombre: 'Tickets',
    descripcion: 'Reportá fallas y seguí cada orden de trabajo desde el aviso hasta la resolución.',
    tile: 'bg-danger-50 text-danger-600 ring-1 ring-danger-200/70 dark:bg-danger-500/10 dark:text-danger-400 dark:ring-danger-400/25',
    activo: 'group-hover:bg-danger-600 group-hover:text-white group-hover:ring-danger-600 dark:group-hover:bg-danger-500 dark:group-hover:ring-danger-500',
  },
  {
    icono: Wrench,
    nombre: 'Mantenimiento',
    descripcion: 'Programá preventivo y correctivo con costos, materiales y responsables asociados.',
    tile: 'bg-warning-50 text-warning-700 ring-1 ring-warning-200/70 dark:bg-warning-500/10 dark:text-warning-400 dark:ring-warning-400/25',
    activo: 'group-hover:bg-warning-500 group-hover:text-white group-hover:ring-warning-500 dark:group-hover:bg-warning-500 dark:group-hover:ring-warning-500',
  },
  {
    icono: ClipboardCheck,
    nombre: 'Evaluaciones',
    descripcion: 'Aplicá checklists de inspección técnica con puntajes comparables por espacio.',
    tile: 'bg-primary-50 text-primary-600 ring-1 ring-primary-200/70 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-400/25',
    activo: 'group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600 dark:group-hover:bg-primary-500 dark:group-hover:ring-primary-500',
  },
  {
    icono: BarChart3,
    nombre: 'Reportes',
    descripcion: 'Exportá análisis de estado y presupuesto para decidir con datos, no con intuiciones.',
    tile: 'bg-success-50 text-success-700 ring-1 ring-success-200/70 dark:bg-success-500/10 dark:text-success-400 dark:ring-success-400/25',
    activo: 'group-hover:bg-success-600 group-hover:text-white group-hover:ring-success-600 dark:group-hover:bg-success-500 dark:group-hover:ring-success-500',
  },
];

function Funcionalidades() {
  return (
    <section id="funcionalidades" className="scroll-mt-6 border-y border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/40">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <motion.div
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={revelar}
          className="max-w-2xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">Módulos</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl dark:text-white">
            Seis módulos, una sola fuente de verdad
          </h2>
          <p className="mt-4 text-base leading-relaxed text-surface-500 dark:text-surface-300">
            Cada módulo comparte la misma información: lo que se inspecciona alimenta los tickets,
            los tickets alimentan el mantenimiento y todo termina en reportes.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {modulos.map((m, i) => (
            <motion.article
              key={m.nombre}
              initial="oculto"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              custom={i % 3}
              variants={revelar}
              className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated dark:border-surface-800 dark:bg-surface-900"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-5 font-display text-[88px] font-bold leading-none text-surface-100 select-none dark:text-surface-800/60"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <span
                  className={cn(
                    'inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200',
                    m.tile,
                    m.activo,
                  )}
                >
                  <m.icono className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-surface-900 dark:text-white">{m.nombre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-300">{m.descripcion}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

const pilares = [
  {
    numero: '01',
    titulo: 'El problema',
    texto:
      'Durante años, el estado de las escuelas vivió en carpetas de papel y planillas que nadie actualizaba. Las inspecciones existían, pero su información se perdía en un cajón; las fallas se arreglaban cuando ya eran urgencias.',
  },
  {
    numero: '02',
    titulo: 'El propósito',
    texto:
      'Una sola fuente de verdad sobre la infraestructura: qué espacios hay, en qué estado están, quién es responsable y cuánto cuesta ponerlo en valor. Sin papeles perdidos ni datos duplicados.',
  },
  {
    numero: '03',
    titulo: 'Cómo lo logra',
    texto:
      'La inspección alimenta los tickets, los tickets ordenan el mantenimiento y todo se convierte en reportes claros. Seis módulos conectados para decidir dónde invertir primero, con evidencia.',
  },
];

function Proposito() {
  return (
    <section id="proposito" className="scroll-mt-6">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <motion.div
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={revelar}
          className="relative order-2 lg:order-1"
        >
          <div
            aria-hidden
            className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-[28px] bg-primary-100/70 dark:bg-primary-500/10"
          />
          <div className="overflow-hidden rounded-3xl shadow-elevated ring-1 ring-surface-200 dark:ring-surface-800">
            <img
              src="/img/historia-mie.svg"
              alt="Inspector relevando el estado de un espacio educativo"
              className="aspect-square w-full object-cover"
              width="1200"
              height="1200"
            />
          </div>
        </motion.div>

        <div className="order-1 lg:order-2">
          <motion.div
            initial="oculto"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={revelar}
          >
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">Por qué existe</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl dark:text-white">
              Del papel al dato, del reclamo a la decisión
            </h2>
          </motion.div>

          <div className="mt-8 space-y-7">
            {pilares.map((p, i) => (
              <motion.div
                key={p.numero}
                initial="oculto"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={i + 1}
                variants={revelar}
                className="relative rounded-2xl border border-surface-200 bg-white p-5 pl-6 shadow-card sm:p-6 sm:pl-7 dark:border-surface-800 dark:bg-surface-900"
              >
                <span
                  aria-hidden
                  className="absolute -left-3 top-6 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-display text-xs font-bold text-white shadow-soft"
                >
                  {p.numero}
                </span>
                <h3 className="font-display text-base font-bold text-surface-900 sm:text-lg dark:text-white">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-surface-500 sm:text-[15px] dark:text-surface-300">{p.texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="leading-none">
              <span className="font-display text-2xl font-bold tracking-tight text-surface-900 dark:text-white">MIE</span>
              <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-400">
                Monitoreo de Infraestructura Educacional
              </span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
              Registro, seguimiento y evaluación del estado de los espacios educativos
              para decidir con datos, no con intuiciones.
            </p>
          </div>

          <ul className="grid gap-2.5 text-sm text-surface-500 dark:text-surface-300">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary-500" />
              contacto@infraedu.ar
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary-500" />
              +54 11 5555-0198 · Lun a Vie de 8 a 16 h
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-primary-500" />
              Barranquilla, Colombia
            </li>
          </ul>
        </div>

        <div className="mt-10 border-t border-surface-200 pt-5 dark:border-surface-800">
          <p className="text-center text-xs text-surface-400">
            © 2026 MIE — Monitoreo de Infraestructura Educacional. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-svh bg-white text-surface-800 antialiased dark:bg-surface-950 dark:text-surface-100">
      <main>
        <Hero />
        <Funcionalidades />
        <Proposito />
      </main>
      <Footer />
    </div>
  );
}
