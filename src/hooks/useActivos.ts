import { useQuery } from '@tanstack/react-query';
import { activosService } from '@/services/activosService';

export function useActivos() {
  return useQuery({
    queryKey: ['activos-select'],
    queryFn: () => activosService.listar({ pageSize: 1000 }),
    select: (data) => data.data,
  });
}
