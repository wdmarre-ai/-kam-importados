import { useQuery } from '@tanstack/react-query';
import { clienteRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useClientes() {
  const sucursal = useStore((s) => s.sucursal);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', sucursal?.id],
    queryFn: () => (sucursal ? clienteRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  return { clientes, isLoading };
}
