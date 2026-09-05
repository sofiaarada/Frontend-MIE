import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, List, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Mantenimiento, EstadoTicket } from '@/types';
import { mantenimientoService, type MantenimientoInput } from '@/services/mantenimientoService';
import { usuariosService } from '@/services/usuariosService';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatearMoneda } from '@/utils/format';
import { mensajeError } from '@/utils/errores';
import { cn } from '@/utils/cn';
import { MantenimientoCalendar } from './MantenimientoCalendar';
import { MantenimientoTable } from './MantenimientoTable';
import { MantenimientoFormModal, type MantenimientoFormValues, type ResponsableOpcion } from './MantenimientoFormModal';

type FiltroEstado = 'TODOS' | EstadoTicket;
const filtros: { value: FiltroEstado; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'FINALIZADO', label: 'Finalizado' },
];

export function MantenimientoPage() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((s) => s.session?.usuario);
  const [vista, setVista] = useState<'calendario' | 'tabla'>('calendario');
  const [estado, setEstado] = useState<FiltroEstado>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<Mantenimiento | null>(null);
  const [itemAEliminar, setItemAEliminar] = useState<Mantenimiento | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['mantenimiento'],
    queryFn: mantenimientoService.listar,
  });

  const { data: responsables = [] } = useQuery<ResponsableOpcion[]>({
    queryKey: ['responsables'],
    queryFn: async () => {
      try {
        const r = await usuariosService.listar({ pageSize: 1000 });
        return r.data.map((u) => ({ id: u.id, nombre: u.nombre }));
      } catch {
        return usuario ? [{ id: usuario.id, nombre: usuario.nombre }] : [];
      }
    },
  });

  const itemsFiltrados = useMemo(() => {
    let lista = estado === 'TODOS' ? items : items.filter((i) => i.estado === estado);
    const t = busqueda.trim().toLowerCase();
    if (t) {
      lista = lista.filter((i) =>
        i.titulo.toLowerCase().includes(t) ||
        i.responsable.toLowerCase().includes(t) ||
        i.materiales.some((m) => m.toLowerCase().includes(t))
      );
    }
    return lista;
  }, [items, estado, busqueda]);

  const costoTotal = useMemo(() => itemsFiltrados.reduce((acc, i) => acc + i.costo, 0), [itemsFiltrados]);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['mantenimiento'] });

  const abrirNuevo = () => { setItemSeleccionado(null); setModalAbierto(true); };
  const abrirEditar = (i: Mantenimiento) => { setItemSeleccionado(i); setModalAbierto(true); };

  const guardar = async (valores: MantenimientoFormValues) => {
    const input: MantenimientoInput = {
      titulo: valores.titulo,
      activoId: valores.activoId,
      fechaProgramada: valores.fechaProgramada,
      estado: valores.estado,
      responsableId: valores.responsableId || undefined,
      materiales: valores.materiales ?? '',
      costo: Number(valores.costo ?? 0),
    };
    try {
      if (itemSeleccionado) {
        await mantenimientoService.actualizar(itemSeleccionado.id, input);
        toast.success('Mantenimiento actualizado.');
      } else {
        await mantenimientoService.crear(input);
        toast.success('Mantenimiento programado.');
      }
      invalidar();
    } catch (error) {
      toast.error(mensajeError(error));
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
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-xs flex-1">
            <Input
              placeholder="Buscar mantenimiento, responsable o materiales…"
              icono={<Search className="h-4 w-4" />}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <Tabs opciones={filtros} valor={estado} onChange={(v) => setEstado(v as FiltroEstado)} />
        </div>

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
        responsables={responsables}
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