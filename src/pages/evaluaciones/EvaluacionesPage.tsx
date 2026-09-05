import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Inspeccion } from '@/types';
import { inspeccionesService, type InspeccionInput } from '@/services/inspeccionesService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { EvaluacionCard } from './EvaluacionCard';
import { EvaluacionFormModal } from './EvaluacionFormModal';

export function EvaluacionesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState<Inspeccion | null>(null);
  const [soloLectura, setSoloLectura] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const { data: inspecciones = [], isLoading } = useQuery({
    queryKey: ['evaluaciones'],
    queryFn: inspeccionesService.listar,
  });

  const inspeccionesFiltradas = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return inspecciones;
    return inspecciones.filter((i) => i.espacioNombre.toLowerCase().includes(t) || i.inspector.toLowerCase().includes(t));
  }, [inspecciones, busqueda]);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['evaluaciones'] });

  const abrirNueva = () => { setInspeccionSeleccionada(null); setSoloLectura(false); setModalAbierto(true); };
  const abrirVer = (i: Inspeccion) => { setInspeccionSeleccionada(i); setSoloLectura(true); setModalAbierto(true); };

  const guardar = async (valores: InspeccionInput) => {
    try {
      if (inspeccionSeleccionada) {
        await inspeccionesService.actualizar(inspeccionSeleccionada.id, valores);
        toast.success('Evaluación actualizada.');
      } else {
        await inspeccionesService.crear(valores);
        toast.success('Evaluación registrada.');
      }
      invalidar();
    } catch {
      toast.error('No se pudo guardar la evaluación.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Evaluaciones de estado</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
        <Button icono={<Plus className="h-4 w-4" />} onClick={abrirNueva}>
          Nueva evaluación
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-xs flex-1">
          <Input
            placeholder="Buscar espacio o inspector…"
            icono={<Search className="h-4 w-4" />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
        </div>
      ) : inspecciones.length === 0 ? (
        <EmptyState titulo="No hay evaluaciones" descripcion="Registrá la primera evaluación de estado." />
      ) : inspeccionesFiltradas.length === 0 ? (
        <EmptyState titulo="Sin resultados" descripcion="No se encontraron evaluaciones para tu búsqueda." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {inspeccionesFiltradas.map((i) => (
            <EvaluacionCard key={i.id} inspeccion={i} onVer={abrirVer} onGenerarOT={() => navigate('/tickets')} />
          ))}
        </div>
      )}

      <EvaluacionFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        inspeccion={inspeccionSeleccionada}
        soloLectura={soloLectura}
      />
    </div>
  );
}
