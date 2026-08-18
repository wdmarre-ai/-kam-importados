import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gastoRepo } from '../../data/repo';
import { useStore } from '../../store';
import type { CategoriaGasto } from '../../domain/tipos';

export function useGastos(from?: string, to?: string) {
  const sucursal = useStore((s) => s.sucursal);
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: gastos = [], isLoading } = useQuery({
    queryKey: ['gastos', sucursal?.id, from, to],
    queryFn: () => (sucursal ? gastoRepo.getAll(sucursal.id, from, to) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const crearMutation = useMutation({
    mutationFn: (gasto: { categoria: CategoriaGasto; descripcion: string; monto: number; fecha: string }) => {
      if (!sucursal || !user) throw new Error('No hay sucursal o usuario');
      return gastoRepo.create({ ...gasto, sucursal_id: sucursal.id, usuario_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos', sucursal?.id] });
    },
  });

  return {
    gastos,
    isLoading,
    crear: crearMutation.mutate,
    isCreando: crearMutation.isPending,
  };
}
