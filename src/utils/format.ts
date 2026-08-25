export const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor);

export const formatearFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

export const iniciales = (nombre: string) =>
  nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/** Formatea un valor crudo según el tipo de columna del reporte. */
export function formatearCelda(valor: unknown, tipo?: string): string {
  if (valor === null || valor === undefined || valor === '') return '';
  switch (tipo) {
    case 'moneda': {
      const n = Number(valor);
      return Number.isNaN(n) ? String(valor) : formatearMoneda(n);
    }
    case 'numero': {
      const n = Number(valor);
      return Number.isNaN(n) ? String(valor) : n.toLocaleString('es-AR');
    }
    case 'porcentaje':
      return `${Number(valor)}%`;
    case 'fecha':
      return formatearFecha(String(valor));
    default:
      return String(valor);
  }
}
