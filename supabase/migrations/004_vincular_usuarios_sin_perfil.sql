-- Vincula como admin de la primera sucursal a cualquier usuario de auth.users
-- que todavía no tenga fila en perfiles (causa de "Sucursal: No seleccionada"
-- y de que las categorías/productos aparezcan vacíos, ya que las políticas
-- RLS dependen de que el usuario tenga sucursal asignada).
INSERT INTO perfiles (user_id, nombre, rol, sucursal_id, activo)
SELECT u.id, COALESCE(u.email, 'Usuario'), 'admin', s.id, true
FROM auth.users u
CROSS JOIN (SELECT id FROM sucursales ORDER BY created_at LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM perfiles p WHERE p.user_id = u.id);
