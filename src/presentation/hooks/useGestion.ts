import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventaRepo, gastoRepo, compraRepo, productoRepo, perfilRepo, stockRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useGestion(from: string, to: string) {
  const sucursal = useStore((s) => s.sucursal);
  const enabled = !!sucursal;
  const queryClient = useQueryClient();

  const { data: ventas = [], isLoading: cargandoVentas } = useQuery({
    queryKey: ['gestion-ventas', sucursal?.id, from, to],
    queryFn: () => (sucursal ? ventaRepo.getAllConDetalle(sucursal.id, from, to) : Promise.resolve([])),
    enabled,
  });

  const { data: gastos = [], isLoading: cargandoGastos } = useQuery({
    queryKey: ['gestion-gastos', sucursal?.id, from, to],
    queryFn: () => (sucursal ? gastoRepo.getAll(sucursal.id, from, to) : Promise.resolve([])),
    enabled,
  });

  const { data: compras = [], isLoading: cargandoCompras } = useQuery({
    queryKey: ['gestion-compras', sucursal?.id, from, to],
    queryFn: () => (sucursal ? compraRepo.getAll(sucursal.id, from, to) : Promise.resolve([])),
    enabled,
  });

  const { data: productos = [] } = useQuery({
    queryKey: ['gestion-productos', sucursal?.id],
    queryFn: () => (sucursal ? productoRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled,
  });

  const { data: perfiles = [] } = useQuery({
    queryKey: ['gestion-perfiles', sucursal?.id],
    queryFn: () => (sucursal ? perfilRepo.getAllBySucursal(sucursal.id) : Promise.resolve([])),
    enabled,
  });

  const isLoading = cargandoVentas || cargandoGastos || cargandoCompras;

  // Estado de resultados
  // Costo de Mercadería Vendida real: costo (a valor del momento de la venta)
  // de los productos que efectivamente se vendieron en el período, no una
  // aproximación por compras del período.
  const ingresosVentas = ventas.reduce((sum: number, v: any) => sum + v.total_pesos, 0);
  const costoVentas = ventas.reduce(
    (sum: number, v: any) =>
      sum + (v.venta_items ?? []).reduce((s: number, item: any) => s + item.costo_unitario * item.cantidad, 0),
    0
  );
  const gastosOperacionales = gastos.reduce((sum: number, g: any) => sum + g.monto, 0);
  const margenBruto = ingresosVentas - costoVentas;
  const gananciaNeta = margenBruto - gastosOperacionales;

  // Flujo de caja: acá sí importa la plata que realmente salió por compras
  // en el período, sin importar si esa mercadería ya se vendió o no.
  const comprasDelPeriodo = compras.reduce((sum: number, c: any) => sum + c.costo_total, 0);
  const entradas = ingresosVentas;
  const salidas = comprasDelPeriodo + gastosOperacionales;
  const flujoNeto = entradas - salidas;

  // Producto más vendido y ventas por categoría
  const cantidadPorProducto = new Map<string, number>();
  const ventasPorCategoria = new Map<string, number>();
  for (const v of ventas as any[]) {
    for (const item of v.venta_items ?? []) {
      // El modelo es un campo opcional al cargar el producto; si no se
      // completó, mostramos la descripción en vez de dejarlo en blanco.
      const nombre = item.producto?.modelo || item.producto?.descripcion || 'Sin nombre';
      cantidadPorProducto.set(nombre, (cantidadPorProducto.get(nombre) ?? 0) + item.cantidad);
      const categoria = item.producto?.categoria?.nombre ?? 'Sin categoría';
      ventasPorCategoria.set(categoria, (ventasPorCategoria.get(categoria) ?? 0) + item.subtotal);
    }
  }
  const productosOrdenados = [...cantidadPorProducto.entries()].sort((a, b) => b[1] - a[1]);
  const productoMasVendido = productosOrdenados[0];
  const topProductos = productosOrdenados.slice(0, 5).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  const ventasPorCategoriaArr = [...ventasPorCategoria.entries()].sort((a, b) => b[1] - a[1]);

  // Ventas por usuario
  const nombrePorUsuarioId = new Map(perfiles.map((p: any) => [p.user_id, p.nombre]));
  const ventasPorUsuario = new Map<string, number>();
  for (const v of ventas as any[]) {
    const nombre = nombrePorUsuarioId.get(v.usuario_id) ?? 'Usuario desconocido';
    ventasPorUsuario.set(nombre, (ventasPorUsuario.get(nombre) ?? 0) + v.total_pesos);
  }

  // Ventas por medio de pago
  const ventasPorMedioPago = new Map<string, number>();
  for (const v of ventas as any[]) {
    ventasPorMedioPago.set(v.medio_pago, (ventasPorMedioPago.get(v.medio_pago) ?? 0) + v.total_pesos);
  }
  const participacionMedioPago = [...ventasPorMedioPago.entries()].map(([medio, monto]) => ({
    medio,
    monto,
    porcentaje: ingresosVentas > 0 ? (monto / ingresosVentas) * 100 : 0,
  }));

  // Ventas por tipo (minorista/mayorista)
  const ventasPorTipo = new Map<string, number>();
  for (const v of ventas as any[]) {
    ventasPorTipo.set(v.tipo, (ventasPorTipo.get(v.tipo) ?? 0) + v.total_pesos);
  }

  // Valorizado de stock por categoría
  const valorizadoPorCategoria = new Map<string, number>();
  for (const p of productos as any[]) {
    const categoria = p.categoria_id ?? 'sin-categoria';
    valorizadoPorCategoria.set(categoria, (valorizadoPorCategoria.get(categoria) ?? 0) + p.costo_unitario);
  }

  const eliminarVentaMutation = useMutation({
    mutationFn: async (venta: any) => {
      if (!sucursal) throw new Error('No hay sucursal seleccionada');
      // Repone el stock de los productos que se habían descontado
      for (const item of venta.venta_items ?? []) {
        if (item.producto_id) {
          await stockRepo.upsertSumando(item.producto_id, sucursal.id, item.cantidad);
        }
      }
      await ventaRepo.delete(venta.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestion-ventas', sucursal?.id] });
      queryClient.invalidateQueries({ queryKey: ['ventas', sucursal?.id] });
      queryClient.invalidateQueries({ queryKey: ['productos', sucursal?.id] });
    },
  });

  return {
    isLoading,
    ventas,
    gastos,
    compras,
    eliminarVenta: eliminarVentaMutation.mutate,
    isEliminandoVenta: eliminarVentaMutation.isPending,
    estadoResultados: { ingresosVentas, costoVentas, gastosOperacionales, margenBruto, gananciaNeta },
    flujoCaja: { entradas, salidas, flujoNeto },
    productoMasVendido,
    topProductos,
    ventasPorCategoria: ventasPorCategoriaArr,
    ventasPorUsuario: [...ventasPorUsuario.entries()],
    participacionMedioPago,
    ventasPorTipo: [...ventasPorTipo.entries()],
    valorizadoPorCategoria: [...valorizadoPorCategoria.entries()],
  };
}
