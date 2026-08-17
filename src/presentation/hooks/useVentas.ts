import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventaRepo, ventaItemRepo, clienteRepo, stockRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useVentas(from?: string, to?: string) {
  const sucursal = useStore((s) => s.sucursal);
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ['ventas', sucursal?.id, from, to],
    queryFn: () =>
      sucursal ? ventaRepo.getAll(sucursal.id, from, to) : Promise.resolve([]),
    enabled: !!sucursal,
  });

  const createVentaCompletaMutation = useMutation({
    mutationFn: async (params: {
      items: Array<{ productoId: string; precio: number; cantidad: number }>;
      clienteNombre: string;
      clienteTelefono: string;
      tipo: 'minorista' | 'mayorista';
      medioPago: string;
      precioDolar?: number;
    }) => {
      if (!sucursal || !user) throw new Error('No sucursal o usuario');

      const { items, clienteNombre, clienteTelefono, tipo, medioPago, precioDolar } = params;

      // 1. Crear o buscar cliente
      const cliente = await clienteRepo.getOrCreate(clienteTelefono, sucursal.id, {
        nombre: clienteNombre,
        tipo,
      });

      // 2. Calcular totales
      const totalPesos = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      const totalUsd = precioDolar ? totalPesos / precioDolar : undefined;

      // 3. Crear venta
      const venta = await ventaRepo.create({
        fecha: new Date().toISOString().split('T')[0],
        cliente_id: cliente.id,
        medio_pago: medioPago,
        tipo,
        total_pesos: totalPesos,
        total_usd: totalUsd,
        precio_dolar_usado: precioDolar,
        usuario_id: user.id,
        sucursal_id: sucursal.id,
        conformidad: true,
      });

      // 4. Crear items de venta
      const ventaItems = items.map((item) => ({
        venta_id: venta.id,
        producto_id: item.productoId,
        precio_venta: item.precio,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad,
      }));

      await ventaItemRepo.createBatch(ventaItems);

      // 5. Actualizar stock (decrementar cantidad)
      for (const item of items) {
        const currentStock = await stockRepo.getByProductoId(item.productoId, sucursal.id);
        if (currentStock) {
          await stockRepo.updateCantidad(
            item.productoId,
            sucursal.id,
            Math.max(0, currentStock.cantidad - item.cantidad)
          );
        }
      }

      return venta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas', sucursal?.id, from, to] });
    },
  });

  return {
    ventas,
    isLoading,
    createVentaCompleta: createVentaCompletaMutation.mutate,
    isCreating: createVentaCompletaMutation.isPending,
    error: createVentaCompletaMutation.error,
  };
}
