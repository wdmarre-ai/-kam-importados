import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { compraRepo, productoRepo, stockRepo, storageRepo } from '../../data/repo';
import { useStore } from '../../store';
import { calcularProrrateoEnvio } from '../../domain/compras';

export interface ItemCompraInput {
  categoria_id: string;
  imei: string;
  descripcion: string;
  color: string;
  modelo: string;
  marca: string;
  bateria_porcentaje: number;
  costo_unitario: number;
  cantidad: number;
  precio_minorista: number;
  precio_mayorista: number;
  imagen?: File | null;
}

export interface CompraCompletaInput {
  proveedor: string;
  costoEnvio: number;
  items: ItemCompraInput[];
}

export function useCompras() {
  const sucursal = useStore((s) => s.sucursal);
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: compras = [], isLoading } = useQuery({
    queryKey: ['compras', sucursal?.id],
    queryFn: () => (sucursal ? compraRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const createCompraCompletaMutation = useMutation({
    mutationFn: async ({ proveedor, costoEnvio, items }: CompraCompletaInput) => {
      if (!sucursal) throw new Error('No hay sucursal seleccionada');
      if (!user) throw new Error('No hay usuario logueado');
      if (items.length === 0) throw new Error('La compra no tiene productos');

      const prorrateo = calcularProrrateoEnvio(
        items.map((it) => ({ costo_unitario: it.costo_unitario, cantidad: it.cantidad })),
        costoEnvio
      );

      const totalCosto = items.reduce((sum, it) => sum + it.costo_unitario * it.cantidad, 0);

      const compra = await compraRepo.create({
        proveedor,
        total_costo: totalCosto,
        costo_envio: costoEnvio,
        costo_total: totalCosto + costoEnvio,
        sucursal_id: sucursal.id,
        usuario_id: user.id,
      });

      const compraItemsData = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const { costo_envio_prorrateo, costo_final_unitario } = prorrateo[i];

        let imagenUrl: string | undefined;
        if (item.imagen) {
          const path = `${sucursal.id}/${Date.now()}-${item.imei || i}.jpg`;
          await storageRepo.uploadFoto('producto-imagenes', path, item.imagen);
          imagenUrl = storageRepo.getPublicUrl('producto-imagenes', path);
        }

        const producto = await productoRepo.create({
          imei: item.imei,
          descripcion: item.descripcion,
          color: item.color,
          modelo: item.modelo,
          marca: item.marca,
          bateria_porcentaje: item.bateria_porcentaje,
          categoria_id: item.categoria_id || null,
          estado: 'en_stock',
          precio_minorista: item.precio_minorista,
          precio_mayorista: item.precio_mayorista,
          costo_unitario: costo_final_unitario,
          imagen_url: imagenUrl,
          sucursal_id: sucursal.id,
        });

        await stockRepo.upsertSumando(producto.id, sucursal.id, item.cantidad);

        compraItemsData.push({
          compra_id: compra.id,
          producto_id: producto.id,
          cantidad: item.cantidad,
          costo_unitario: item.costo_unitario,
          costo_envio_prorrateo,
          costo_final: costo_final_unitario,
        });
      }

      await compraRepo.createItemsBatch(compraItemsData);

      return compra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras', sucursal?.id] });
      queryClient.invalidateQueries({ queryKey: ['productos', sucursal?.id] });
    },
  });

  return {
    compras,
    isLoading,
    createCompraCompleta: createCompraCompletaMutation.mutate,
    isCreating: createCompraCompletaMutation.isPending,
    error: createCompraCompletaMutation.error,
  };
}
