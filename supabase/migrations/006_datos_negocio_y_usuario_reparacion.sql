-- Datos de contacto de la sucursal, para completar en comprobantes/constancias
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS cuit VARCHAR(50);

-- Toda reparación debe quedar registrada por el usuario que la cargó,
-- igual que ya pasa con ventas, compras y gastos.
ALTER TABLE reparaciones ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);

-- Política de UPDATE para sucursales (antes solo tenía SELECT)
DROP POLICY IF EXISTS "usuarios_pueden_editar_sucursal" ON sucursales;
CREATE POLICY "usuarios_pueden_editar_sucursal" ON sucursales FOR UPDATE
  USING (mi_sucursal_id() = id OR es_admin());
