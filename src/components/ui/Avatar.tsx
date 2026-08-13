import { cn } from '@/utils/cn';
import { iniciales } from '@/utils/format';

interface AvatarProps {
  nombre: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tamanos = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

const paleta = ['bg-primary-500', 'bg-success-500', 'bg-warning-500', 'bg-danger-500'];
const colorDesdeNombre = (nombre: string) => paleta[nombre.charCodeAt(0) % paleta.length];

export function Avatar({ nombre, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return <img src={src} alt={nombre} className={cn('rounded-full object-cover', tamanos[size], className)} />;
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        colorDesdeNombre(nombre),
        tamanos[size],
        className
      )}
    >
      {iniciales(nombre)}
    </div>
  );
}
