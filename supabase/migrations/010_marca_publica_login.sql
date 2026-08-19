-- La pantalla de login se ve ANTES de iniciar sesión, así que necesita
-- poder leer el nombre y logo del negocio sin estar autenticado. Se
-- habilita lectura pública de sucursales (no incluye nada sensible del
-- cliente, es la misma info que ya aparece en los comprobantes impresos).
DROP POLICY IF EXISTS "cualquiera_puede_ver_sucursales" ON sucursales;
CREATE POLICY "cualquiera_puede_ver_sucursales" ON sucursales FOR SELECT
  USING (true);
