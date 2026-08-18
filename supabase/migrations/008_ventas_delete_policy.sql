-- Permite borrar una venta solo a quien la generó (o al admin).
-- venta_items se borra en cascada automáticamente (ya definido en el schema).
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_propias_ventas" ON ventas;
CREATE POLICY "usuarios_pueden_eliminar_propias_ventas" ON ventas FOR DELETE
  USING (usuario_id = auth.uid() OR es_admin());
