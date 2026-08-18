import { useQuery } from '@tanstack/react-query';
import { ventaRepo, gastoRepo, compraRepo, productoRepo, perfilRepo } from '../../data/repo';
import { useStore } from '../../store';

export function useGestion(from: string, to: string) {
  const sucursal = useStore((s) => s.sucursal);
  const enabled = !!sucursal;

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
  const ingresosVentas = ventas.reduce((sum: number, v: any) => sum + v.total_pesos, 0);
  const costoVentas = compras.reduce((sum: number, c: any) => sum + c.costo_total, 0);
  const gastosOperacionales = gastos.reduce((sum: number, g: any) => sum + g.monto, 0);
  const margenBruto = ingresosVentas - costoVentas;
  const gananciaNeta = margenBruto - gastosOperacionales;

  // Flujo de caja
  const entradas = ingresosVentas;
  const salidas = costoVentas + gastosOperacionales;
  const flujoNeto = entradas - salidas;

  // Producto más vendido y ventas por categoría
  const cantidadPorProducto = new Map<string, number>();
  const ventasPorCategoria = new Map<string, number>();
  for (const v of ventas as any[]) {
    for (const item of v.venta_items ?? []) {
      const modelo = item.producto?.modelo ?? 'Sin modelo';
      cantidadPorProducto.set(modelo, (cantidadPorProducto.get(modelo) ?? 0) + item.cantidad);
      const categoria = item.producto?.categoria?.nombre ?? 'Sin categoría';
      ventasPorCategoria.set(categoria, (ventasPorCategoria.get(categoria) ?? 0) + item.subtotal);
    }
  }
  const productoMasVendido = [...cantidadPorProducto.entries()].sort((a, b) => b[1] - a[1])[0];
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

  return {
    isLoading,
    ventas,
    gastos,
    compras,
    estadoResultados: { ingresosVentas, costoVentas, gastosOperacionales, margenBruto, gananciaNeta },
    flujoCaja: { entradas, salidas, flujoNeto },
    productoMasVendido,
    ventasPorCategoria: ventasPorCategoriaArr,
    ventasPorUsuario: [...ventasPorUsuario.entries()],
    participacionMedioPago,
    ventasPorTipo: [...ventasPorTipo.entries()],
    valorizadoPorCategoria: [...valorizadoPorCategoria.entries()],
  };
}
