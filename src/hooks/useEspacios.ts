import { useQuery } from '@tanstack/react-query';
import { espaciosService } from '@/services/espaciosService';

export function useEspacios() {
  return useQuery({
    queryKey: ['espacios-select'],
    queryFn: () => espaciosService.listar({ pageSize: 1000 }),
    select: (data) => data.data,
  });
}