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
  comprasEnPeriodo: number;
}

export function useClientes(from?: string, to?: string) {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();
  const hayPeriodo = !!(from && to);

  const { data: clientesBase = [], isLoading: cargandoClientes } = useQuery({
    queryKey: ['clientes', sucursal?.id],
    queryFn: () => (sucursal ? clienteRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  // Todas las compras (histórico) para la frecuencia/semáforo y "última compra"
  const { data: ventas = [], isLoading: cargandoVentas } = useQuery({
    queryKey: ['clientes-ventas', sucursal?.id],
    queryFn: () => (sucursal ? ventaRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  // Solo las compras del período elegido, para la columna "Compras en el período"
  const { data: ventasPeriodo = [], isLoading: cargandoVentasPeriodo } = useQuery({
    queryKey: ['clientes-ventas-periodo', sucursal?.id, from, to],
    queryFn: () => (sucursal ? ventaRepo.getAll(sucursal.id, from, to) : Promise.resolve([])),
    enabled: !!sucursal && hayPeriodo,
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

  const comprasPeriodoPorCliente = new Map<string, number>();
  for (const v of ventasPeriodo as any[]) {
    comprasPeriodoPorCliente.set(v.cliente_id, (comprasPeriodoPorCliente.get(v.cliente_id) ?? 0) + 1);
  }

  const clientes: ClienteConCompras[] = (clientesBase as any[]).map((c) => {
    const info = comprasPorCliente.get(c.id);
    return {
      ...c,
      cantidadCompras: info?.cantidad ?? 0,
      ultimaCompra: info?.ultima ?? null,
      comprasEnPeriodo: comprasPeriodoPorCliente.get(c.id) ?? 0,
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
    isLoading: cargandoClientes || cargandoVentas || (hayPeriodo && cargandoVentasPeriodo),
    hayPeriodo,
    eliminar: eliminarMutation.mutate,
    isEliminando: eliminarMutation.isPending,
  };
}
