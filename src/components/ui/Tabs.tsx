import { cn } from '@/utils/cn';

interface TabOption {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  opciones: TabOption[];
  valor: string;
  onChange: (valor: string) => void;
}

export function Tabs({ opciones, valor, onChange }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-surface-100 p-1 dark:bg-surface-800">
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className={cn(
            'focus-ring flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            valor === op.value
              ? 'bg-white text-surface-800 shadow-soft dark:bg-surface-950 dark:text-white'
              : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
          )}
        >
          {op.label}
          {op.count !== undefined && (
            <span className={cn('rounded-full px-1.5 text-[11px]', valor === op.value ? 'bg-surface-100 dark:bg-surface-800' : 'bg-surface-200/70 dark:bg-surface-700')}>
              {op.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}