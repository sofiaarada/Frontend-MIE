import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Usuario, Role } from '@/types';
import { usuariosService, type UsuarioInput } from '@/services/usuariosService';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UsuariosTable } from './UsuariosTable';
import { UsuarioFormModal, type UsuarioFormValues } from './UsuarioFormModal';

type FiltroRol = 'TODOS' | Role;

export function UsuariosPage() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState<FiltroRol>('TODOS');
  const [page, setPage] = useState(1);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios', { busqueda, rol, page }],
    queryFn: () => usuariosService.listar({ busqueda, rol, page, pageSize: 8 }),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] });

  const abrirNuevo = () => { setUsuarioSeleccionado(null); setModalAbierto(true); };
  const abrirEditar = (u: Usuario) => { setUsuarioSeleccionado(u); setModalAbierto(true); };

  const guardar = async (valores: UsuarioFormValues) => {
    const input: UsuarioInput = valores;
    try {
      if (usuarioSeleccionado) {
        await usuariosService.actualizar(usuarioSeleccionado.id, input);
        toast.success('Usuario actualizado.');
      } else {
        await usuariosService.crear(input);
        toast.success('Usuario creado.');
      }
      invalidar();
    } catch {
      toast.error('No se pudo guardar el usuario.');
    }
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    try {
      await usuariosService.eliminar(usuarioAEliminar.id);
      toast.success('Usuario eliminado.');
      invalidar();
      setUsuarioAEliminar(null);
    } catch {
      toast.error('No se pudo eliminar el usuario.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Inst. Educativo San Martín · Ciclo 2026
          </p>
        </div>
        <Button icono={<Plus className="h-4 w-4" />} onClick={abrirNuevo}>
          Nuevo usuario
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-xs flex-1">
          <Input
            placeholder="Buscar por nombre o correo..."
            icono={<Search className="h-4 w-4" />}
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-48">
          <Select value={rol} onChange={(e) => { setRol(e.target.value as FiltroRol); setPage(1); }}>
            <option value="TODOS">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="COORDINADOR">Coordinador</option>
            <option value="INSPECTOR">Inspector</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </Select>
        </div>
      </div>

      <Card className="p-2">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <UsuariosTable usuarios={data?.data ?? []} onEditar={abrirEditar} onEliminar={setUsuarioAEliminar} />
        )}
      </Card>

      {data && data.total > 0 && (
        <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
      )}

      <UsuarioFormModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        usuario={usuarioSeleccionado}
      />

      <ConfirmDialog
        abierto={!!usuarioAEliminar}
        onCerrar={() => setUsuarioAEliminar(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar usuario"
        descripcion={`¿Seguro que querés eliminar a "${usuarioAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
      />
    </div>
  );
}