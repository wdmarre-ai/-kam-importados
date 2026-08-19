import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteRepo, ventaRepo } from '../../data/repo';
import { useStore } from '../../store';

export interface ClienteConCompras {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipo: 'minorista' | 'mayorista';
  cantidadCompras: number;
  ultimaCompra: string | null;
}

export function useClientes() {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();

  const { data: clientesBase = [], isLoading: cargandoClientes } = useQuery({
    queryKey: ['clientes', sucursal?.id],
    queryFn: () => (sucursal ? clienteRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const { data: ventas = [], isLoading: cargandoVentas } = useQuery({
    queryKey: ['clientes-ventas', sucursal?.id],
    queryFn: () => (sucursal ? ventaRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const comprasPorCliente = new Map<string, { cantidad: number; ultima: string }>();
  for (const v of ventas as any[]) {
    const actual = comprasPorCliente.get(v.cliente_id);
    if (!actual) {
      comprasPorCliente.set(v.cliente_id, { cantidad: 1, ultima: v.fecha });
    } else {
      actual.cantidad += 1;
      if (v.fecha > actual.ultima) actual.ultima = v.fecha;
    }
  }

  const clientes: ClienteConCompras[] = (clientesBase as any[]).map((c) => {
    const info = comprasPorCliente.get(c.id);
    return {
      ...c,
      cantidadCompras: info?.cantidad ?? 0,
      ultimaCompra: info?.ultima ?? null,
    };
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => clienteRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes', sucursal?.id] });
    },
  });

  return {
    clientes,
    isLoading: cargandoClientes || cargandoVentas,
    eliminar: eliminarMutation.mutate,
    isEliminando: eliminarMutation.isPending,
  };
}
