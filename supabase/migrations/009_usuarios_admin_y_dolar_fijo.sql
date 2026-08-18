-- Guarda el email en perfiles (para poder listar usuarios sin acceder a
-- auth.users, que no es accesible vía API desde el cliente).
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Cotización del dólar fija por sucursal, para no tener que escribirla
-- cada vez en Ventas o al actualizar costos en Mercadería.
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS cotizacion_dolar_actual DECIMAL(15,2);

-- Faltaban políticas de escritura para perfiles (antes solo tenía SELECT,
-- por lo que ni el admin podía crear o editar usuarios).
DROP POLICY IF EXISTS "admin_puede_crear_perfiles" ON perfiles;
CREATE POLICY "admin_puede_crear_perfiles" ON perfiles FOR INSERT
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "admin_o_propio_puede_editar_perfil" ON perfiles;
CREATE POLICY "admin_o_propio_puede_editar_perfil" ON perfiles FOR UPDATE
  USING (es_admin() OR user_id = auth.uid());
