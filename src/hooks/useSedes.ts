import { useQuery } from '@tanstack/react-query';
import { resourcesApi } from '@/services/api/resources';

interface SedeDB {
  id_sede: string;
  nombre_sede: string;
  direccion?: string;
  ciudad?: string;
}

function mapSede(db: SedeDB) {
  return {
    id: db.id_sede,
    nombre: db.nombre_sede,
    direccion: db.direccion ?? '',
    ciudad: db.ciudad ?? '',
  };
}

export function useSedes() {
  return useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const result = await resourcesApi.listar<SedeDB>('sedes', { pageSize: 1000 });
      return result.data.map(mapSede);
    },
  });
}
