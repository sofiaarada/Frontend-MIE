import jsPDF from 'jspdf';
import { formatearCelda, formatearFecha } from './format';

export type TipoColumna = 'texto' | 'moneda' | 'numero' | 'porcentaje' | 'fecha';

export interface ColumnaReporte {
  clave: string;
  titulo: string;
  /** Define cómo se muestra en la vista previa y cómo se exporta (PDF/Excel). */
  tipo?: TipoColumna;
}

type FilasReporte = Record<string, unknown>[];


function aNumero(valor: unknown): number | null {
  if (typeof valor === 'number') return Number.isNaN(valor) ? null : valor;
  if (typeof valor === 'string') {
    const limpio = valor.replace(/[^0-9,.-]/g, '');
    if (!limpio || limpio === '-' || limpio === '.') return null;
    const normalizado = /,\d+$/.test(limpio)
      ? limpio.replace(/\./g, '').replace(',', '.')
      : limpio.replace(/\./g, '');
    const n = Number(normalizado);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

// Genera un PDF simple (encabezado + tabla de texto) a partir de filas de datos.
// No usa un plugin de tablas para mantener las dependencias livianas; alcanza
// para reportes de una página como los de este módulo.
export function exportarPDF(nombreArchivo: string, titulo: string, columnas: ColumnaReporte[], filas: FilasReporte) {
  const doc = new jsPDF();
  const margenX = 14;
  let y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, margenX, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inst. Educativo San Martín · Generado el ${formatearFecha(new Date().toISOString())}`, margenX, y + 6);
  y += 16;

  const anchoCol = (210 - margenX * 2) / columnas.length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  columnas.forEach((col, i) => doc.text(col.titulo, margenX + i * anchoCol, y));
  y += 2;
  doc.setDrawColor(200);
  doc.line(margenX, y, 210 - margenX, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  filas.forEach((fila) => {
    if (y > 280) { doc.addPage(); y = 20; }
    columnas.forEach((col, i) => {
      const texto = formatearCelda(fila[col.clave], col.tipo);
      doc.text(texto.length > 28 ? texto.slice(0, 25) + '...' : texto, margenX + i * anchoCol, y);
    });
    y += 7;
  });

  doc.save(`${nombreArchivo}.pdf`);
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Genera un .xlsx con presentación cuidada usando ExcelJS (carga diferida):
 * título con merge, encabezado destacado, panel congelado, autofiltro,
 * anchos autoajustados y celdas reales (moneda/número/porcentaje/fecha).
 */
export async function exportarExcel(
  nombreArchivo: string,
  hoja: string,
  tituloReporte: string,
  columnas: ColumnaReporte[],
  filas: FilasReporte,
) {
  const { Workbook } = await import('exceljs');
  const wb = new Workbook();
  const ws = wb.addWorksheet(hoja.slice(0, 31).replace(/[\\/*?:[\]]/g, ''));

  const nCols = Math.max(columnas.length, 1);

  // Fila 1 — título del reporte
  if (nCols > 1) ws.mergeCells(1, 1, 1, nCols);
  const cTitulo = ws.getCell(1, 1);
  cTitulo.value = tituloReporte;
  cTitulo.font = { size: 14, bold: true, color: { argb: 'FF0F172A' } };

  // Fila 2 — datos institucionales
  if (nCols > 1) ws.mergeCells(2, 1, 2, nCols);
  const cMeta = ws.getCell(2, 1);
  cMeta.value = `Inst. Educativo San Martín · Generado el ${formatearFecha(new Date().toISOString())}`;
  cMeta.font = { size: 9, italic: true, color: { argb: 'FF64748B' } };

  // Fila 4 — encabezados
  const encabezado = ws.getRow(4);
  columnas.forEach((col, i) => {
    const c = encabezado.getCell(i + 1);
    c.value = col.titulo;
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    c.alignment = { vertical: 'middle' };
  });
  encabezado.height = 20;

  // Datos desde la fila 5
  const numFmtPorTipo: Record<string, string | undefined> = {
    moneda: '"$" #,##0',
    numero: '#,##0',
    porcentaje: '0%',
    fecha: 'dd/mm/yyyy',
  };

  filas.forEach((fila, r) => {
    const row = ws.getRow(5 + r);
    columnas.forEach((col, i) => {
      const c = row.getCell(i + 1);
      const v = fila[col.clave];

      if (v === null || v === undefined || v === '') {
        c.value = '';
      } else {
        switch (col.tipo) {
          case 'moneda':
          case 'numero': {
            const n = aNumero(v);
            c.value = n ?? String(v);
            break;
          }
          case 'porcentaje': {
            const n = aNumero(v);
            c.value = n === null ? String(v) : n / 100;
            break;
          }
          case 'fecha': {
            const d = new Date(String(v));
            c.value = Number.isNaN(d.getTime()) ? String(v) : d;
            break;
          }
          default:
            c.value = String(v);
        }
      }

      const numFmt = numFmtPorTipo[col.tipo ?? ''];
      if (numFmt && typeof c.value === 'number') c.numFmt = numFmt;
      if (r % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    });
  });

  // Anchos autoajustados al contenido visible
  columnas.forEach((col, i) => {
    let ancho = col.titulo.length;
    filas.forEach((f) => {
      const largo = formatearCelda(f[col.clave], col.tipo).length;
      if (largo > ancho) ancho = largo;
    });
    ws.getColumn(i + 1).width = Math.min(Math.max(ancho + 4, 11), 52);
  });

  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + filas.length, column: nCols } };
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  const buffer = await wb.xlsx.writeBuffer();
  descargar(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${nombreArchivo}.xlsx`,
  );
}
