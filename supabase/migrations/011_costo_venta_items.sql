-- Guarda una "foto" del costo del producto en el momento exacto de la
-- venta, para calcular el Costo de Mercadería Vendida real (no una
-- aproximación por compras del período). Si más adelante se actualiza
-- el costo del producto (ej: por cotización del dólar), las ventas ya
-- hechas no deben verse afectadas retroactivamente.
ALTER TABLE venta_items ADD COLUMN IF NOT EXISTS costo_unitario DECIMAL(15,2) NOT NULL DEFAULT 0;
