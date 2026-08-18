import { useState } from 'react';
import { useStore } from '../../store';
import { sucursalRepo, storageRepo } from '../../data/repo';

export default function Admin() {
  const sucursal = useStore((s) => s.sucursal);
  const setSucursal = useStore((s) => s.setSucursal);

  const [nombre, setNombre] = useState(sucursal?.nombre ?? '');
  const [direccion, setDireccion] = useState(sucursal?.direccion ?? '');
  const [ciudad, setCiudad] = useState(sucursal?.ciudad ?? '');
  const [telefono, setTelefono] = useState(sucursal?.telefono ?? '');
  const [cuit, setCuit] = useState(sucursal?.cuit ?? '');
  const [logo, setLogo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursal) return;
    setGuardando(true);
    setErrorMsg('');
    try {
      let logoUrl = sucursal.logo_url;
      if (logo) {
        const path = `${sucursal.id}/logo-${Date.now()}.${logo.name.split('.').pop()}`;
        await storageRepo.uploadFoto('negocio-logos', path, logo);
        logoUrl = storageRepo.getPublicUrl('negocio-logos', path);
      }

      const actualizada = await sucursalRepo.update(sucursal.id, {
        nombre,
        direccion,
        ciudad,
        telefono,
        cuit,
        logo_url: logoUrl,
      });
      setSucursal(actualizada);
      setLogo(null);
      setSuccessMsg('✅ Datos del negocio actualizados');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err: any) {
      setErrorMsg(`❌ Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Administración
      </h1>

      <div className="card max-w-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          🏢 Datos del Negocio
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Estos datos aparecen en los comprobantes de venta y constancias de reparación.
        </p>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm mb-4">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 text-sm mb-4">
            {successMsg}
          </div>
        )}

        {!sucursal ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando sucursal...</p>
        ) : (
          <form onSubmit={handleGuardar} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo del negocio
              </label>
              <div className="flex items-center gap-3">
                {(logo || sucursal.logo_url) && (
                  <img
                    src={logo ? URL.createObjectURL(logo) : sucursal.logo_url}
                    alt="Logo"
                    className="w-16 h-16 object-contain border border-gray-200 dark:border-gray-700 rounded-lg bg-white"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                  className="input-field w-full text-sm"
                  disabled={guardando}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del negocio
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field w-full"
                disabled={guardando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="input-field w-full"
                placeholder="Calle y número"
                disabled={guardando}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="input-field w-full"
                  disabled={guardando}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="input-field w-full"
                  placeholder="+54 9 261..."
                  disabled={guardando}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CUIT (opcional)
              </label>
              <input
                type="text"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                className="input-field w-full"
                disabled={guardando}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Datos'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
