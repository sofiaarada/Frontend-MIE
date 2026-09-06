export const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);

export const formatearFecha = (iso: string) => {
  if (!iso) return '';
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  let fecha: Date;
  if (partes) {
    fecha = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  } else {
    fecha = new Date(iso);
  }
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(fecha);
};

export const iniciales = (nombre: string) =>
  nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/** Formatea un número con miles por punto y decimales por coma (sin símbolo). */
export const formatearNumeroMoneda = (n: number) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Convierte texto formateado (1.500.000,50) a número. Devuelve null si no es válido. */
export const textoMonedaANumero = (texto: string): number | null => {
  const limpio = texto.replace(/\./g, '').replace(',', '.');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
};

/** Máscara de moneda: puntos de miles + hasta 2 decimales con coma. */
export const aplicarMascaraMoneda = (texto: string): string => {
  const limpio = texto.replace(/[^\d.,]/g, '');
  const fragmentos = limpio.split(',');
  if (fragmentos.length > 2) return limpio;
  const enteros = fragmentos[0].replace(/\D/g, '');
  const tieneComa = limpio.includes(',');
  const enterosFormat = enteros ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(enteros)) : '';
  if (!tieneComa) return enterosFormat;
  const decimales = fragmentos[1] ? fragmentos[1].slice(0, 2) : '';
  return (enterosFormat || '0') + ',' + decimales;
};

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
