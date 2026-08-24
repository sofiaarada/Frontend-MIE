import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ColumnaReporte {
  clave: string;
  titulo: string;
}

// Genera un PDF simple (encabezado + tabla de texto) a partir de filas de datos.
// No usa un plugin de tablas para mantener las dependencias livianas; alcanza
// para reportes de una página como los de este módulo.
export function exportarPDF(nombreArchivo: string, titulo: string, columnas: ColumnaReporte[], filas: Record<string, string>[]) {
  const doc = new jsPDF();
  const margenX = 14;
  let y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, margenX, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inst. Educativo San Martín · Generado el ${new Date().toLocaleDateString('es-AR')}`, margenX, y + 6);
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
      const texto = String(fila[col.clave] ?? '');
      doc.text(texto.length > 28 ? texto.slice(0, 25) + '...' : texto, margenX + i * anchoCol, y);
    });
    y += 7;
  });

  doc.save(`${nombreArchivo}.pdf`);
}

// Genera un archivo .xlsx real (formato Excel) a partir de un arreglo de objetos.
export function exportarExcel(nombreArchivo: string, hoja: string, filas: Record<string, unknown>[]) {
  const worksheet = XLSX.utils.json_to_sheet(filas);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, hoja);
  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
}