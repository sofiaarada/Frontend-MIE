import { useEffect, useState } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { exportarPDF, exportarExcel } from '@/utils/exportes';
import type { DatosReporte } from '@/services/reportesService';

interface ReportePreviewModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  archivo: string;
  usaFechas?: boolean;
  cargarDatos: (desde?: string, hasta?: string) => Promise<DatosReporte>;
}

export function ReportePreviewModal({ abierto, onCerrar, titulo, archivo, usaFechas, cargarDatos }: ReportePreviewModalProps) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState<DatosReporte | null>(null);
  const [cargando, setCargando] = useState(false);

  const refrescar = async (d?: string, h?: string) => {
    setCargando(true);
    try {
      const resultado = await cargarDatos(d, h);
      setDatos(resultado);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (abierto) {
      setDesde('');
      setHasta('');
      refrescar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      descripcion="Vista previa antes de descargar."
      size="lg"
      footer={
        <>
          <Button variant="outline" icono={<FileDown className="h-4 w-4" />} disabled={!datos || datos.filas.length === 0} onClick={() => datos && exportarPDF(archivo, titulo, datos.columnas, datos.filas)}>
            Descargar PDF
          </Button>
          <Button icono={<FileSpreadsheet className="h-4 w-4" />} disabled={!datos || datos.filas.length === 0} onClick={() => datos && exportarExcel(archivo, titulo, datos.filas)}>
            Descargar Excel
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {usaFechas && (
          <div className="flex items-end gap-3">
            <Input label="Desde" type="date" value={desde} onChange={(e) => { setDesde(e.target.value); refrescar(e.target.value, hasta); }} />
            <Input label="Hasta" type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); refrescar(desde, e.target.value); }} />
          </div>
        )}

        {cargando ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : !datos || datos.filas.length === 0 ? (
          <EmptyState titulo="Sin datos" descripcion="No hay resultados para el período seleccionado." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-surface-100 dark:border-surface-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50 text-surface-400 dark:border-surface-800 dark:bg-surface-800/60">
                  {datos.columnas.map((col) => <th key={col.clave} className="px-3 py-2 font-medium">{col.titulo}</th>)}
                </tr>
              </thead>
              <tbody>
                {datos.filas.map((fila, i) => (
                  <tr key={i} className="border-b border-surface-50 last:border-0 dark:border-surface-800/60">
                    {datos.columnas.map((col) => <td key={col.clave} className="px-3 py-2 text-surface-600 dark:text-surface-300">{fila[col.clave]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}