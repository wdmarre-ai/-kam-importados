-- KAM Importados - Corrige recursión infinita en RLS y agrega políticas de escritura
--
-- Problema encontrado: las políticas originales de sucursales/productos/stock/
-- clientes/ventas/reparaciones/gastos (y la propia perfiles) chequean "es admin"
-- con un subquery "SELECT 1 FROM perfiles WHERE ...". Como esa tabla también
-- tiene RLS activado, evaluar esa condición vuelve a disparar las políticas de
-- perfiles, y como una de ellas hace el mismo subquery, entra en recursión
-- infinita (error 42P17). Esto rompía la carga del perfil/sucursal para
-- cualquier usuario.
--
-- Solución: funciones SECURITY DEFINER que consultan perfiles sin pasar por RLS
-- (patrón recomendado por Supabase para este caso), usadas en todas las políticas.
-- Además se agregan las políticas de INSERT/UPDATE/DELETE que faltaban (el
-- schema original solo tenía SELECT, por lo que ninguna pantalla podía guardar).

-- FUNCIONES AUXILIARES (bypassan RLS intencionalmente)
CREATE OR REPLACE FUNCTION es_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles WHERE user_id = auth.uid() AND rol = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION mi_sucursal_id() RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT sucursal_id FROM perfiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- PERFILES: reemplaza la política recursiva
DROP POLICY IF EXISTS "admin_can_view_all_profiles" ON perfiles;
CREATE POLICY "admin_can_view_all_profiles" ON perfiles FOR SELECT
  USING (es_admin());

-- SUCURSALES
DROP POLICY IF EXISTS "users_can_view_their_branch" ON sucursales;
CREATE POLICY "users_can_view_their_branch" ON sucursales FOR SELECT
  USING (mi_sucursal_id() = id OR es_admin());

-- PRODUCTOS
DROP POLICY IF EXISTS "users_can_view_branch_products" ON productos;
CREATE POLICY "users_can_view_branch_products" ON productos FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_productos" ON productos;
CREATE POLICY "usuarios_pueden_crear_productos" ON productos FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_editar_productos" ON productos;
CREATE POLICY "usuarios_pueden_editar_productos" ON productos FOR UPDATE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_eliminar_productos" ON productos;
CREATE POLICY "usuarios_pueden_eliminar_productos" ON productos FOR DELETE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

-- STOCK
DROP POLICY IF EXISTS "users_can_view_branch_stock" ON stock;
CREATE POLICY "users_can_view_branch_stock" ON stock FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_stock" ON stock;
CREATE POLICY "usuarios_pueden_crear_stock" ON stock FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_editar_stock" ON stock;
CREATE POLICY "usuarios_pueden_editar_stock" ON stock FOR UPDATE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

-- CLIENTES
DROP POLICY IF EXISTS "users_can_view_branch_clients" ON clientes;
CREATE POLICY "users_can_view_branch_clients" ON clientes FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_clientes" ON clientes;
CREATE POLICY "usuarios_pueden_crear_clientes" ON clientes FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_editar_clientes" ON clientes;
CREATE POLICY "usuarios_pueden_editar_clientes" ON clientes FOR UPDATE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

-- VENTAS
DROP POLICY IF EXISTS "users_can_view_branch_sales" ON ventas;
CREATE POLICY "users_can_view_branch_sales" ON ventas FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_ventas" ON ventas;
CREATE POLICY "usuarios_pueden_crear_ventas" ON ventas FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

-- VENTA ITEMS
DROP POLICY IF EXISTS "usuarios_pueden_crear_venta_items" ON venta_items;
CREATE POLICY "usuarios_pueden_crear_venta_items" ON venta_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM ventas v WHERE v.id = venta_items.venta_id
      AND (mi_sucursal_id() = v.sucursal_id OR es_admin()))
  );

DROP POLICY IF EXISTS "usuarios_pueden_ver_venta_items" ON venta_items;
CREATE POLICY "usuarios_pueden_ver_venta_items" ON venta_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM ventas v WHERE v.id = venta_items.venta_id
      AND (mi_sucursal_id() = v.sucursal_id OR es_admin()))
  );

-- CATEGORÍAS (catálogo compartido, no tiene sucursal_id)
DROP POLICY IF EXISTS "usuarios_pueden_ver_categorias" ON categorias;
CREATE POLICY "usuarios_pueden_ver_categorias" ON categorias FOR SELECT
  USING (mi_sucursal_id() IS NOT NULL OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_categorias" ON categorias;
CREATE POLICY "usuarios_pueden_crear_categorias" ON categorias FOR INSERT
  WITH CHECK (mi_sucursal_id() IS NOT NULL OR es_admin());

-- COMPRAS
DROP POLICY IF EXISTS "usuarios_pueden_crear_compras" ON compras;
CREATE POLICY "usuarios_pueden_crear_compras" ON compras FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_ver_compras" ON compras;
CREATE POLICY "usuarios_pueden_ver_compras" ON compras FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

-- COMPRA ITEMS
DROP POLICY IF EXISTS "usuarios_pueden_crear_compra_items" ON compra_items;
CREATE POLICY "usuarios_pueden_crear_compra_items" ON compra_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM compras c WHERE c.id = compra_items.compra_id
      AND (mi_sucursal_id() = c.sucursal_id OR es_admin()))
  );

DROP POLICY IF EXISTS "usuarios_pueden_ver_compra_items" ON compra_items;
CREATE POLICY "usuarios_pueden_ver_compra_items" ON compra_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM compras c WHERE c.id = compra_items.compra_id
      AND (mi_sucursal_id() = c.sucursal_id OR es_admin()))
  );

-- REPARACIONES
DROP POLICY IF EXISTS "users_can_view_branch_repairs" ON reparaciones;
CREATE POLICY "users_can_view_branch_repairs" ON reparaciones FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_reparaciones" ON reparaciones;
CREATE POLICY "usuarios_pueden_crear_reparaciones" ON reparaciones FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_editar_reparaciones" ON reparaciones;
CREATE POLICY "usuarios_pueden_editar_reparaciones" ON reparaciones FOR UPDATE
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

-- GASTOS
DROP POLICY IF EXISTS "users_can_view_branch_expenses" ON gastos;
CREATE POLICY "users_can_view_branch_expenses" ON gastos FOR SELECT
  USING (mi_sucursal_id() = sucursal_id OR es_admin());

DROP POLICY IF EXISTS "usuarios_pueden_crear_gastos" ON gastos;
CREATE POLICY "usuarios_pueden_crear_gastos" ON gastos FOR INSERT
  WITH CHECK (mi_sucursal_id() = sucursal_id OR es_admin());

-- STORAGE: fotos de productos y reparaciones
DROP POLICY IF EXISTS "usuarios_autenticados_suben_imagenes_producto" ON storage.objects;
CREATE POLICY "usuarios_autenticados_suben_imagenes_producto" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'producto-imagenes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "usuarios_autenticados_suben_fotos_reparacion" ON storage.objects;
CREATE POLICY "usuarios_autenticados_suben_fotos_reparacion" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reparacion-fotos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cualquiera_ve_imagenes_producto" ON storage.objects;
CREATE POLICY "cualquiera_ve_imagenes_producto" ON storage.objects FOR SELECT
  USING (bucket_id = 'producto-imagenes');

DROP POLICY IF EXISTS "cualquiera_ve_fotos_reparacion" ON storage.objects;
CREATE POLICY "cualquiera_ve_fotos_reparacion" ON storage.objects FOR SELECT
  USING (bucket_id = 'reparacion-fotos');
