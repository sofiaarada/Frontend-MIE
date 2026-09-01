import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, List, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Mantenimiento, EstadoTicket } from '@/types';
import { mantenimientoService } from '@/services/mantenimientoService';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatearMoneda } from '@/utils/format';
import { cn } from '@/utils/cn';
import { MantenimientoCalendar } from './MantenimientoCalendar';
import { MantenimientoTable } from './MantenimientoTable';
import { MantenimientoFormModal, type MantenimientoFormValues } from './MantenimientoFormModal';

type FiltroEstado = 'TODOS' | EstadoTicket;
const filtros: { value: FiltroEstado; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

export function MantenimientoPage() {
  const queryClient = useQueryClient();
  const [vista, setVista] = useState<'calendario' | 'tabla'>('calendario');
  const [estado, setEstado] = useState<FiltroEstado>('TODOS');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<Mantenimiento | null>(null);
  const [itemAEliminar, setItemAEliminar] = useState<Mantenimiento | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['mantenimiento'],
    queryFn: mantenimientoService.listar,
  });

  const itemsFiltrados = useMemo(
    () => (estado === 'TODOS' ? items : items.filter((i) => i.estado === estado)),
    [items, estado]
  );

  const costoTotal = useMemo(() => itemsFiltrados.reduce((acc, i) => acc + i.costo, 0), [itemsFiltrados]);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['mantenimiento'] });

  const abrirNuevo = () => { setItemSeleccionado(null); setModalAbierto(true); };
  const abrirEditar = (i: Mantenimiento) => { setItemSeleccionado(i); setModalAbierto(true); };

  const guardar = async (valores: MantenimientoFormValues) => {
    try {
      if (itemSeleccionado) {
        await mantenimientoService.actualizar(itemSeleccionado.id, valores);
        toast.success('Mantenimiento actualizado.');
      } else {
        await mantenimientoService.crear(valores);
        toast.success('Mantenimiento programado.');
      }
      invalidar();
    } catch {
      toast.error('No se pudo guardar el mantenimiento.');
    }
  };

  const confirmarEliminar = async () => {
    if (!itemAEliminar) return;
    setEliminando(true);
    try {
      await mantenimientoService.eliminar(itemAEliminar.id);
      toast.success('Mantenimiento eliminado.');
      invalidar();
      setItemAEliminar(null);
    } catch {
      toast.error('No se pudo eliminar el mantenimiento.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Mantenimiento</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
        <Button icono={<Plus className="h-4 w-4" />} onClick={abrirNuevo}>
          Programar mantenimiento
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs opciones={filtros} valor={estado} onChange={(v) => setEstado(v as FiltroEstado)} />

        <div className="inline-flex items-center gap-1 self-start rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
          <button
            onClick={() => setVista('calendario')}
            className={cn('focus-ring flex h-8 w-8 items-center justify-center rounded-md', vista === 'calendario' ? 'bg-white shadow-soft dark:bg-surface-950' : 'text-surface-400')}
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVista('tabla')}
            className={cn('focus-ring flex h-8 w-8 items-center justify-center rounded-md', vista === 'tabla' ? 'bg-white shadow-soft dark:bg-surface-950' : 'text-surface-400')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : vista === 'calendario' ? (
        <MantenimientoCalendar items={itemsFiltrados} onAbrir={abrirEditar} />
      ) : (
        <Card className="p-2">
          <MantenimientoTable items={itemsFiltrados} onEditar={abrirEditar} onEliminar={setItemAEliminar} />
        </Card>
      )}

      {itemsFiltrados.length > 0 && (
        <p className="text-right text-xs text-surface-500 dark:text-surface-400">
          Costo total {estado !== 'TODOS' ? 'de esta vista' : 'programado'}: <span className="font-semibold text-surface-800 dark:text-surface-100">{formatearMoneda(costoTotal)}</span>
        </p>
      )}

      <MantenimientoFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        item={itemSeleccionado}
      />

      <ConfirmDialog
        abierto={!!itemAEliminar}
        onCerrar={() => setItemAEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar mantenimiento"
        descripcion={`¿Seguro que querés eliminar "${itemAEliminar?.titulo}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
      />
    </div>
  );
}