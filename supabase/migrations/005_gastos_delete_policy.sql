-- Faltaba la política para poder borrar gastos (solo había INSERT/SELECT).
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_gastos" ON gastos;
CREATE POLICY "usuarios_pueden_eliminar_gastos" ON gastos FOR DELETE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());
