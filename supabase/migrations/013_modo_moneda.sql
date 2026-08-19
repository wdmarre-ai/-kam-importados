-- Define cómo el comercio maneja costo vs. precio de venta:
-- 'costo_usd_precio_ars': el costo del producto es un valor fijo en
--   dólares (no cambia si sube el dólar), los precios de venta están en
--   pesos y sí se reajustan al actualizar la cotización.
-- 'misma_moneda': costo y precios están en la misma moneda, sin
--   conversión entre ellos.
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS modo_moneda VARCHAR(30) NOT NULL DEFAULT 'costo_usd_precio_ars';
