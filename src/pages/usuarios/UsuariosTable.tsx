import { Pencil, Ban, Users } from 'lucide-react';
import type { UsuarioAdmin } from '@/services/usuariosService';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatearFecha } from '@/utils/format';

interface UsuariosTableProps {
  usuarios: UsuarioAdmin[];
  onEditar: (usuario: UsuarioAdmin) => void;
  onEliminar: (usuario: UsuarioAdmin) => void;
}

export function UsuariosTable({ usuarios, onEditar, onEliminar }: UsuariosTableProps) {
  if (usuarios.length === 0) {
    return <EmptyState icono={Users} titulo="No hay usuarios" descripcion="Ajustá los filtros o creá un nuevo usuario." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-100 text-xs text-surface-400 dark:border-surface-800">
            <th className="px-3 py-3 font-medium">Usuario</th>
            <th className="px-3 py-3 font-medium">Rol</th>
            <th className="px-3 py-3 font-medium">Sede</th>
            <th className="px-3 py-3 font-medium">Estado</th>
            <th className="px-3 py-3 font-medium">Desde</th>
            <th className="px-3 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50 dark:border-surface-800/60 dark:hover:bg-surface-800/40">
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar nombre={u.nombre} src={u.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-surface-800 dark:text-surface-100">{u.nombre}</p>
                    <p className="truncate text-xs text-surface-400">{u.correo}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3"><Badge tono="neutral">{u.rol}</Badge></td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{u.sede}</td>
              <td className="px-3 py-3">
                <Badge tono={u.activo ? 'success' : 'danger'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
              </td>
              <td className="px-3 py-3 text-surface-500 dark:text-surface-400">{formatearFecha(u.creadoEn)}</td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEditar(u)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEliminar(u)} aria-label={u.activo ? 'Bloquear usuario' : 'Desbloquear usuario'} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10">
                    <Ban className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
