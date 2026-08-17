import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useProductos() {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();

  const { data: productos = [], isLoading, error } = useQuery({
    queryKey: ['productos', sucursal?.id],
    queryFn: () => (sucursal ? productoRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const createMutation = useMutation({
    mutationFn: (producto: any) => productoRepo.create(producto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos', sucursal?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      productoRepo.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos', sucursal?.id] });
    },
  });

  const getByImei = async (imei: string) => {
    if (!sucursal) return null;
    return productoRepo.getByImei(imei, sucursal.id);
  };

  return {
    productos,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    getByImei,
  };
}
