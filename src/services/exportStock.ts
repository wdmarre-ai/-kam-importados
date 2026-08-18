import type { Producto } from '../domain/tipos';

export function generarCsvStock(productos: Producto[]): string {
  const encabezado = [
    'IMEI',
    'Descripcion',
    'Marca',
    'Modelo',
    'Color',
    'Bateria %',
    'Costo',
    'Precio Minorista',
    'Precio Mayorista',
    'Estado',
  ];

  const filas = productos.map((p) => [
    p.imei,
    p.descripcion,
    p.marca,
    p.modelo,
    p.color,
    p.bateria_porcentaje,
    p.costo_unitario,
    p.precio_minorista,
    p.precio_mayorista,
    p.estado,
  ]);

  const escapar = (valor: unknown) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

  return [encabezado, ...filas].map((fila) => fila.map(escapar).join(';')).join('\n');
}

export function descargarCsvStock(productos: Producto[]) {
  const csv = generarCsvStock(productos);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
