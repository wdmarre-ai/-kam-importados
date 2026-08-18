// Cálculo de prorrateo de costo de envío entre los productos de una compra

export interface ItemParaProrratear {
  costo_unitario: number;
  cantidad: number;
}

export interface ItemProrrateado {
  costo_envio_prorrateo: number; // total prorrateado para toda la línea (cantidad incluida)
  costo_final_unitario: number; // costo_unitario + envío prorrateado por unidad
}

/**
 * Reparte el costo de envío entre los items de una compra según el peso
 * relativo de cada uno en el costo total (costo_unitario * cantidad).
 */
export function calcularProrrateoEnvio(
  items: ItemParaProrratear[],
  costoEnvioTotal: number
): ItemProrrateado[] {
  const totalCosto = items.reduce((sum, it) => sum + it.costo_unitario * it.cantidad, 0);

  return items.map((item) => {
    const valorLinea = item.costo_unitario * item.cantidad;
    const proporcion = totalCosto > 0 ? valorLinea / totalCosto : 0;
    const costoEnvioLinea = costoEnvioTotal * proporcion;
    const costoEnvioPorUnidad = item.cantidad > 0 ? costoEnvioLinea / item.cantidad : 0;

    return {
      costo_envio_prorrateo: costoEnvioLinea,
      costo_final_unitario: item.costo_unitario + costoEnvioPorUnidad,
    };
  });
}
