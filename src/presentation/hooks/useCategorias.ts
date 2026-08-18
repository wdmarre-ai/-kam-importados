import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriaRepo } from '../../data/repo';

const CATEGORIAS_POR_DEFECTO = ['iPhone', 'Samsung', 'Accesorios', 'Otros'];

export function useCategorias() {
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriaRepo.getAll(),
  });

  useEffect(() => {
    if (!isLoading && categorias.length === 0) {
      Promise.all(CATEGORIAS_POR_DEFECTO.map((nombre) => categoriaRepo.getOrCreate(nombre))).then(
        () => queryClient.invalidateQueries({ queryKey: ['categorias'] })
      );
    }
  }, [isLoading, categorias.length, queryClient]);

  return { categorias, isLoading };
}
