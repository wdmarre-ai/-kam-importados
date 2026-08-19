-- Permite eliminar clientes (antes solo se podía ver/crear/editar).
-- Un cliente con ventas o reparaciones asociadas no se puede borrar
-- porque esas tablas tienen una FK NOT NULL a clientes (sin CASCADE),
-- así que el borrado falla solo en esos casos, protegiendo el historial.
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_clientes" ON clientes;
CREATE POLICY "usuarios_pueden_eliminar_clientes" ON clientes FOR DELETE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());
