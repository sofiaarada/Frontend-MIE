import type {
  Espacio, EstadoInfraestructura, Inspeccion, KpiDashboard, Mantenimiento, Notificacion, Ticket,
} from '@/types';
import { espaciosService } from './espaciosService';
import { ticketsService } from './ticketsService';
import { mantenimientoService } from './mantenimientoService';
import { dashboardService } from './dashboardService';
import { inspeccionesService } from './inspeccionesService';

// ---------------------------------------------------------------------------
// Tipos de respuesta: el asistente responde con "tarjetas", no texto plano.
// ---------------------------------------------------------------------------

export type RespuestaAsistente =
  | { tipo: 'texto'; texto: string; sugerir?: boolean }
  | { tipo: 'espacio'; espacio: Espacio; inspeccion?: Inspeccion; ticketsAbiertos: Ticket[] }
  | { tipo: 'tickets'; titulo: string; nota?: string; tickets: Ticket[] }
  | { tipo: 'agenda'; titulo: string; items: Mantenimiento[] }
  | { tipo: 'presupuesto'; total: number; meses: { mes: string; valor: number }[]; nota: string }
  | {
      tipo: 'ranking';
      titulo: string;
      nota: string;
      items: { nombre: string; estado: EstadoInfraestructura; puntaje: number; problemas: number }[];
    }
  | { tipo: 'resumen'; kpi: KpiDashboard; alertasNoLeidas: number };

interface DatosSistema {
  espacios: Espacio[];
  tickets: Ticket[];
  mantenimientos: Mantenimiento[];
  inspecciones: Inspeccion[];
  kpi: KpiDashboard;
  notificaciones: Notificacion[];
}

async function cargarDatos(): Promise<DatosSistema> {
  const [espacios, tickets, mantenimientos, inspecciones, kpi, notificaciones] = await Promise.all([
    espaciosService.listar({ pageSize: 100 }).then((p) => p.data),
    ticketsService.listar(),
    mantenimientoService.listar(),
    inspeccionesService.listar(),
    dashboardService.obtenerKpis(),
    dashboardService.obtenerNotificaciones(),
  ]);
  return { espacios, tickets, mantenimientos, inspecciones, kpi, notificaciones: notificaciones as Notificacion[] };
}

// ---------------------------------------------------------------------------
// Normalización de texto (español rioplatense, tolerante a tildes y signos).
// ---------------------------------------------------------------------------

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:¿?¡!()"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const claves = (t: string) => t.split(' ').filter(Boolean);

/** Coincidencia flexible entre la consulta y el nombre/código de un espacio. */
function buscarEspacio(consultaNormalizada: string, espacios: Espacio[]): Espacio | undefined {
  let mejor: { espacio: Espacio; puntaje: number } | undefined;

  for (const espacio of espacios) {
    const nombre = normalizar(espacio.nombre).replace(/\./g, '');
    const codigo = normalizar(espacio.codigo).replace(/-/g, '');

    for (const palabra of new Set([...claves(nombre), codigo])) {
      if (palabra.length < 3) continue;
      if (consultaNormalizada.includes(palabra)) {
        const puntaje = palabra.length + (nombre.includes(consultaNormalizada) ? 20 : 0);
        if (!mejor || puntaje > mejor.puntaje) mejor = { espacio, puntaje };
      }
    }
  }
  return mejor?.espacio;
}

const tiene = (consulta: string, ...palabras: string[]) => palabras.some((p) => consulta.includes(p));

// ---------------------------------------------------------------------------
// Intenciones
// ---------------------------------------------------------------------------

const PESO_ESTADO: Record<EstadoInfraestructura, number> = {
  CRITICO: 0,
  DETERIORADO: 1,
  REGULAR: 2,
  BUENO: 3,
};

function responderEstadoEspacio(datos: DatosSistema, espacio: Espacio): RespuestaAsistente {
  const inspeccion = datos.inspecciones
    .filter((i) => i.espacioId === espacio.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const ticketsAbiertos = datos.tickets
    .filter((t) => t.espacioNombre === espacio.nombre && t.estado !== 'FINALIZADO')
    .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));

  return { tipo: 'espacio', espacio, inspeccion, ticketsAbiertos };
}

function responderUrgentes(datos: DatosSistema): RespuestaAsistente {
  const hoy = new Date().toISOString().slice(0, 10);
  const abiertos = datos.tickets.filter((t) => t.estado !== 'FINALIZADO');
  const urgentes = abiertos.filter((t) => t.prioridad === 'URGENTE' || t.prioridad === 'ALTA');
  const vencidos = abiertos.filter((t) => !urgentes.includes(t) && t.fechaVencimiento < hoy);

  const lista = [...urgentes, ...vencidos].slice(0, 5);
  const restantes = urgentes.length + vencidos.length - lista.length;

  return {
    tipo: 'tickets',
    titulo: urgentes.length ? 'Urgencias y prioridades altas' : 'Órdenes vencidas',
    nota: restantes > 0 ? `Hay ${restantes} más en el módulo de Tickets.` : undefined,
    tickets: lista,
  };
}

function responderAgenda(datos: DatosSistema): RespuestaAsistente {
  const hoy = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const enDias = (n: number) => {
    const f = new Date(hoy);
    f.setDate(f.getDate() + n);
    return iso(f);
  };

  const semana = datos.mantenimientos.filter(
    (m) => m.estado !== 'FINALIZADO' && m.fechaProgramada >= enDias(-3) && m.fechaProgramada <= enDias(7)
  );
  const proximos = datos.mantenimientos
    .filter((m) => m.estado !== 'FINALIZADO' && m.fechaProgramada > enDias(7))
    .slice(0, 5);

  const items = semana.length ? semana : proximos;
  return {
    tipo: 'agenda',
    titulo: semana.length ? 'Mantenimientos de esta semana' : 'Próximos mantenimientos',
    items,
  };
}

async function responderPresupuesto(): Promise<RespuestaAsistente> {
  const meses = await dashboardService.obtenerPresupuesto();
  const total = meses.reduce((acc, m) => acc + m.valor, 0) * 1000;
  const maximo = Math.max(...meses.map((m) => m.valor));
  const pico = meses.find((m) => m.valor === maximo);
  return {
    tipo: 'presupuesto',
    total,
    meses,
    nota: pico ? `El mes más alto fue ${pico.mes}.` : '',
  };
}

function responderRanking(datos: DatosSistema): RespuestaAsistente {
  const items = datos.espacios
    .map((e) => {
      const inspecciones = datos.inspecciones.filter((i) => i.espacioId === e.id);
      const puntaje = inspecciones.length
        ? Math.round(inspecciones.reduce((a, i) => a + i.puntajeGlobal, 0) / inspecciones.length)
        : PESO_ESTADO[e.estado] * 25;
      return { nombre: e.nombre, estado: e.estado, puntaje, problemas: e.problemasActivos };
    })
    .sort((a, b) => PESO_ESTADO[a.estado] - PESO_ESTADO[b.estado] || a.puntaje - b.puntaje)
    .slice(0, 4);

  return {
    tipo: 'ranking',
    titulo: 'Dónde invertir primero',
    nota: 'Ordenado por estado de infraestructura y puntaje de inspección.',
    items,
  };
}

function responderResumen(datos: DatosSistema): RespuestaAsistente {
  return {
    tipo: 'resumen',
    kpi: datos.kpi,
    alertasNoLeidas: datos.notificaciones.filter((n) => n.tipo === 'ALERTA' && !n.leido).length,
  };
}

const TEXTO_AYUDA =
  'Puedo ayudarte con el estado de cualquier espacio, urgencias pendientes, la agenda de mantenimiento, el presupuesto y dónde conviene invertir primero. Probame preguntándome algo.';

export async function consultar(pregunta: string): Promise<RespuestaAsistente> {
  const q = normalizar(pregunta);
  const datos = await cargarDatos();

  // Saludos y ayuda van primero: no necesitan datos.
  if (/^(hola|buenas|buen dia|hey|holis|que tal)/.test(q)) {
    return { tipo: 'texto', texto: '¡Hola! Soy el asistente de MIE. ' + TEXTO_AYUDA, sugerir: true };
  }
  if (tiene(q, 'ayuda', 'que podes', 'que sabes', 'como funcionas', 'para que servis')) {
    return { tipo: 'texto', texto: TEXTO_AYUDA, sugerir: true };
  }

  // Consulta de un espacio concreto (aunque no diga "estado").
  const espacio = buscarEspacio(q, datos.espacios);
  if (espacio && tiene(q, 'estado', 'como esta', 'puntaje', 'inspec', 'problema', 'detalle', 'contame')) {
    return responderEstadoEspacio(datos, espacio);
  }

  if (tiene(q, 'presupuesto', 'gasto', 'invertido')) return responderPresupuesto();
  if (tiene(q, 'urgente', 'urgentes', 'emergencia', 'vencid', 'critico', 'criticos', 'alta prioridad')) {
    return responderUrgentes(datos);
  }
  if (tiene(q, 'mantenimien', 'agenda', 'programad', 'esta semana', 'calendario')) {
    return responderAgenda(datos);
  }
  if (tiene(q, 'invertir', 'inversion', 'recomienda', 'recomendas', 'priorizar', 'conviene', 'primero')) {
    return responderRanking(datos);
  }
  if (tiene(q, 'resumen', 'como esta todo', 'estado general', 'panorama', 'overall')) {
    return responderResumen(datos);
  }

  // Nombró un espacio sin pedir explícitamente su estado: igual mostramos la ficha.
  if (espacio) return responderEstadoEspacio(datos, espacio);

  return { tipo: 'texto', texto: 'Mmm, esa no la tengo clara. ' + TEXTO_AYUDA, sugerir: true };
}
