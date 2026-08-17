import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useClientes() {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', sucursal?.id],
    queryFn: () => (sucursal ? clienteRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const createMutation = useMutation({
    mutationFn: (cliente: any) => clienteRepo.create(cliente),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes', sucursal?.id] });
    },
  });

  const getOrCreate = async (telefono: string, clienteData: any) => {
    const existing = await clienteRepo.getByTelefono(telefono);
    if (existing) return existing;

    const newCliente = {
      ...clienteData,
      telefono,
      sucursal_id: sucursal?.id,
    };
    return clienteRepo.create(newCliente);
  };

  return {
    clientes,
    isLoading,
    create: createMutation.mutate,
    getOrCreate,
    isCreating: createMutation.isPending,
  };
}
