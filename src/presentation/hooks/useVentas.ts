import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventaRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useVentas(from?: string, to?: string) {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ['ventas', sucursal?.id, from, to],
    queryFn: () =>
      sucursal ? ventaRepo.getAll(sucursal.id, from, to) : Promise.resolve([]),
    enabled: !!sucursal,
  });

  const createMutation = useMutation({
    mutationFn: (venta: any) => ventaRepo.create(venta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas', sucursal?.id, from, to] });
    },
  });

  return {
    ventas,
    isLoading,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
