-- Vincula una venta con la reparación que la generó (cuando se cobra un
-- service al entregarlo). Nullable: las ventas normales de productos no
-- usan esta columna.
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS reparacion_id UUID REFERENCES reparaciones(id);

CREATE INDEX IF NOT EXISTS idx_ventas_reparacion ON ventas(reparacion_id);
