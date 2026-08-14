import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  titulo: string;
  descripcion: string;
  cargando?: boolean;
}

export function ConfirmDialog({ abierto, onCerrar, onConfirmar, titulo, descripcion, cargando }: ConfirmDialogProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirmar} cargando={cargando}>Eliminar</Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-500 dark:bg-danger-500/10">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <p className="text-sm text-surface-600 dark:text-surface-300">{descripcion}</p>
      </div>
    </Modal>
  );
}