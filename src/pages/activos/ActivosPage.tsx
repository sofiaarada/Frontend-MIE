import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { Activo } from '@/types';
import { activosService, type ActivoInput } from '@/services/activosService';
import { categoriasActivo } from '@/services/mock/mockData';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatearMoneda } from '@/utils/format';
import { ActivosTable } from './ActivosTable';
import { ActivoFormModal, type ActivoFormValues } from './ActivoFormModal';

type FiltroEstado = 'TODOS' | Activo['estado'];

export function ActivosPage() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string>('TODAS');
  const [estado, setEstado] = useState<FiltroEstado>('TODOS');
  const [page, setPage] = useState(1);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
  const [activoAEliminar, setActivoAEliminar] = useState<Activo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['activos', { busqueda, categoria, estado, page }],
    queryFn: () => activosService.listar({ busqueda, categoria, estado, page, pageSize: 8 }),
  });

  const { data: resumen } = useQuery({
    queryKey: ['activos-resumen', data?.total],
    queryFn: activosService.resumen,
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['activos'] });
    queryClient.invalidateQueries({ queryKey: ['activos-resumen'] });
  };

  const abrirNuevo = () => { setActivoSeleccionado(null); setModalAbierto(true); };
  const abrirEditar = (a: Activo) => { setActivoSeleccionado(a); setModalAbierto(true); };

  const guardar = async (valores: ActivoFormValues) => {
    const input: ActivoInput = valores;
    try {
      if (activoSeleccionado) {
        await activosService.actualizar(activoSeleccionado.id, input);
        toast.success('Activo actualizado.');
      } else {
        await activosService.crear(input);
        toast.success('Activo registrado.');
      }
      invalidar();
    } catch {
      toast.error('No se pudo guardar el activo.');
    }
  };

  const confirmarEliminar = async () => {
    if (!activoAEliminar) return;
    setEliminando(true);
    try {
      await activosService.eliminar(activoAEliminar.id);
      toast.success('Activo eliminado.');
      invalidar();
      setActivoAEliminar(null);
    } catch {
      toast.error('No se pudo eliminar el activo.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Inventario de activos</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
        <Button icono={<Plus className="h-4 w-4" />} onClick={abrirNuevo}>
          Registrar activo
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-xs flex-1">
          <Input
            placeholder="Buscar activo, código..."
            icono={<Search className="h-4 w-4" />}
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-44">
          <Select value={categoria} onChange={(e) => { setCategoria(e.target.value); setPage(1); }}>
            <option value="TODAS">Todas las categorías</option>
            {categoriasActivo.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div className="w-40">
          <Select value={estado} onChange={(e) => { setEstado(e.target.value as FiltroEstado); setPage(1); }}>
            <option value="TODOS">Todos los estados</option>
            <option value="BUENO">Bueno</option>
            <option value="REGULAR">Regular</option>
            <option value="DETERIORADO">Deteriorado</option>
            <option value="CRITICO">Crítico</option>
          </Select>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-surface-400 sm:flex">
          <Filter className="h-3.5 w-3.5" /> {data?.total ?? 0} resultados
        </span>
      </div>

      <Card className="p-2">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <ActivosTable activos={data?.data ?? []} onEditar={abrirEditar} onEliminar={setActivoAEliminar} />
        )}
      </Card>

      {data && data.total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          {resumen && (
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Valor total del inventario: <span className="font-semibold text-surface-800 dark:text-surface-100">{formatearMoneda(resumen.valorTotal)}</span>
            </p>
          )}
        </div>
      )}

      <ActivoFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        activo={activoSeleccionado}
      />

      <ConfirmDialog
        abierto={!!activoAEliminar}
        onCerrar={() => setActivoAEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar activo"
        descripcion={`¿Seguro que querés eliminar "${activoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
      />
    </div>
  );
}