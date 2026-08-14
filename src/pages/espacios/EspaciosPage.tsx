import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Espacio } from '@/types';
import { espaciosService, type EspacioInput } from '@/services/espaciosService';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/utils/cn';
import { EspacioCard } from './EspacioCard';
import { EspaciosTable } from './EspaciosTable';
import { EspacioFormModal, type EspacioFormValues } from './EspacioFormModal';

type VistaEstado = 'TODOS' | Espacio['estado'];
const filtrosEstado: { value: VistaEstado; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'BUENO', label: 'Bueno' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'DETERIORADO', label: 'Deteriorado' },
  { value: 'CRITICO', label: 'Crítico' },
];

export function EspaciosPage() {
  const queryClient = useQueryClient();
  const [vista, setVista] = useState<'cards' | 'tabla'>('cards');
  const [estado, setEstado] = useState<VistaEstado>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Espacio | null>(null);
  const [soloLectura, setSoloLectura] = useState(false);
  const [espacioAEliminar, setEspacioAEliminar] = useState<Espacio | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['espacios', { busqueda, estado, page }],
    queryFn: () => espaciosService.listar({ busqueda, estado, page, pageSize: 8 }),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['espacios'] });

  const abrirNuevo = () => { setEspacioSeleccionado(null); setSoloLectura(false); setModalAbierto(true); };
  const abrirEditar = (e: Espacio) => { setEspacioSeleccionado(e); setSoloLectura(false); setModalAbierto(true); };
  const abrirVer = (e: Espacio) => { setEspacioSeleccionado(e); setSoloLectura(true); setModalAbierto(true); };

  const guardar = async (valores: EspacioFormValues) => {
    const input: EspacioInput = { ...valores, fotoUrl: valores.fotoUrl || undefined };
    try {
      if (espacioSeleccionado) {
        await espaciosService.actualizar(espacioSeleccionado.id, input);
        toast.success('Espacio actualizado.');
      } else {
        await espaciosService.crear(input);
        toast.success('Espacio registrado.');
      }
      invalidar();
    } catch {
      toast.error('No se pudo guardar el espacio.');
    }
  };

  const confirmarEliminar = async () => {
    if (!espacioAEliminar) return;
    setEliminando(true);
    try {
      await espaciosService.eliminar(espacioAEliminar.id);
      toast.success('Espacio eliminado.');
      invalidar();
      setEspacioAEliminar(null);
    } catch {
      toast.error('No se pudo eliminar el espacio.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Gestión de espacios</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
        <Button icono={<Plus className="h-4 w-4" />} onClick={abrirNuevo}>
          Nuevo espacio
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-xs flex-1">
            <Input
              placeholder="Buscar espacio, código..."
              icono={<Search className="h-4 w-4" />}
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
            />
          </div>
          <Tabs
            opciones={filtrosEstado}
            valor={estado}
            onChange={(v) => { setEstado(v as VistaEstado); setPage(1); }}
          />
        </div>

        <div className="inline-flex items-center gap-1 self-start rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
          <button
            onClick={() => setVista('cards')}
            className={cn('focus-ring flex h-8 w-8 items-center justify-center rounded-md', vista === 'cards' ? 'bg-white shadow-soft dark:bg-surface-950' : 'text-surface-400')}
          >
            <LayoutGrid className="h-4 w-4" />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : vista === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.data.map((e) => (
            <EspacioCard key={e.id} espacio={e} onVer={abrirVer} onEditar={abrirEditar} />
          ))}
        </div>
      ) : (
        <Card className="p-2">
          <EspaciosTable espacios={data?.data ?? []} onVer={abrirVer} onEditar={abrirEditar} onEliminar={setEspacioAEliminar} />
        </Card>
      )}

      {data && data.total > 0 && (
        <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
      )}

      <EspacioFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        espacio={espacioSeleccionado}
        soloLectura={soloLectura}
      />

      <ConfirmDialog
        abierto={!!espacioAEliminar}
        onCerrar={() => setEspacioAEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar espacio"
        descripcion={`¿Seguro que querés eliminar "${espacioAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
      />
    </div>
  );
}