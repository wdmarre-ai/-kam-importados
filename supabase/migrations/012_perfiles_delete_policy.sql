-- Permite al admin eliminar el perfil de un usuario (le quita el acceso
-- a la app). No borra la cuenta de login en sí (eso requiere hacerlo
-- desde el dashboard de Supabase o una función de servidor con permisos
-- de administrador, que el cliente no puede tener por seguridad).
DROP POLICY IF EXISTS "admin_puede_eliminar_perfiles" ON perfiles;
CREATE POLICY "admin_puede_eliminar_perfiles" ON perfiles FOR DELETE
  USING (es_admin());
