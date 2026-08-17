import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useStock() {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();

  const getStockMutation = useMutation({
    mutationFn: (productoId: string) =>
      sucursal
        ? stockRepo.getByProductoId(productoId, sucursal.id)
        : Promise.reject('No sucursal'),
  });

  const updateStockMutation = useMutation({
    mutationFn: ({
      productoId,
      cantidad,
    }: {
      productoId: string;
      cantidad: number;
    }) =>
      sucursal
        ? stockRepo.updateCantidad(productoId, sucursal.id, cantidad)
        : Promise.reject('No sucursal'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });

  return {
    getStock: getStockMutation.mutate,
    updateStock: updateStockMutation.mutate,
    isLoading: getStockMutation.isPending || updateStockMutation.isPending,
  };
}
