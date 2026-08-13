export const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor);

export const formatearFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

export const iniciales = (nombre: string) =>
  nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
