import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['categorias'] });

  const crearMutation = useMutation({
    mutationFn: (nombre: string) => categoriaRepo.getOrCreate(nombre),
    onSuccess: invalidar,
  });

  const renombrarMutation = useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) => categoriaRepo.update(id, nombre),
    onSuccess: invalidar,
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => categoriaRepo.delete(id),
    onSuccess: invalidar,
  });

  return {
    categorias,
    isLoading,
    crear: crearMutation.mutate,
    isCreando: crearMutation.isPending,
    renombrar: renombrarMutation.mutate,
    isRenombrando: renombrarMutation.isPending,
    eliminar: eliminarMutation.mutate,
    isEliminando: eliminarMutation.isPending,
  };
}
