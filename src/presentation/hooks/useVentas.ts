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
      items: Array<{ productoId: string; precio: number; costoUnitario: number; cantidad: number }>;
      clienteNombre: string;
      clienteTelefono: string;
      clienteEmail?: string;
      tipo: 'minorista' | 'mayorista';
      medioPago: string;
      precioDolar?: number;
      costoEnvio?: number;
      conformidad: boolean;
      infoGarantia?: string;
    }) => {
      if (!sucursal || !user) throw new Error('No sucursal o usuario');

      if (sucursal.modo_moneda === 'costo_usd_precio_ars' && !params.precioDolar) {
        throw new Error('Falta la cotización del dólar para registrar la venta con el costo correcto.');
      }

      const {
        items,
        clienteNombre,
        clienteTelefono,
        clienteEmail,
        tipo,
        medioPago,
        precioDolar,
        costoEnvio = 0,
        conformidad,
        infoGarantia,
      } = params;

      // 0. Validar stock real antes de vender (por si cambió desde que se armó el carrito)
      for (const item of items) {
        const stockActual = await stockRepo.getByProductoId(item.productoId, sucursal.id);
        if (!stockActual || stockActual.cantidad < item.cantidad) {
          throw new Error(
            `No hay stock suficiente (disponible: ${stockActual?.cantidad ?? 0}). Actualizá el carrito.`
          );
        }
      }

      // 1. Crear o buscar cliente
      let cliente = await clienteRepo.getOrCreate(clienteTelefono, sucursal.id, {
        nombre: clienteNombre,
        tipo,
        email: clienteEmail || null,
      });
      if (clienteEmail && !cliente.email) {
        cliente = await clienteRepo.update(cliente.id, { email: clienteEmail });
      }

      // 2. Calcular totales (incluye costo de envío si lo hay)
      const totalPesos = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0) + costoEnvio;
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
        conformidad,
        info_garantia: infoGarantia || null,
      });

      // 4. Crear items de venta
      // El costo se guarda en la misma moneda que precio_venta (pesos) para que
      // el margen sea consistente. Si el costo está fijado en USD, se convierte
      // con el dólar usado en esta venta.
      const convertirCosto = sucursal.modo_moneda === 'costo_usd_precio_ars';
      const ventaItems = items.map((item) => ({
        venta_id: venta.id,
        producto_id: item.productoId,
        precio_venta: item.precio,
        costo_unitario: convertirCosto && precioDolar ? item.costoUnitario * precioDolar : item.costoUnitario,
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

      return { venta, cliente, totalPesos };
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
