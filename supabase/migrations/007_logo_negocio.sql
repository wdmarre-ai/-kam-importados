-- Logo del negocio, para mostrar en comprobantes y constancias
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS logo_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('negocio-logos', 'negocio-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "usuarios_autenticados_suben_logo" ON storage.objects;
CREATE POLICY "usuarios_autenticados_suben_logo" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'negocio-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cualquiera_ve_logo" ON storage.objects;
CREATE POLICY "cualquiera_ve_logo" ON storage.objects FOR SELECT
  USING (bucket_id = 'negocio-logos');
