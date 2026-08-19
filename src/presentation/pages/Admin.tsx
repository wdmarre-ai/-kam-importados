import { useState } from 'react';
import { useStore } from '../../store';
import { sucursalRepo, storageRepo } from '../../data/repo';
import { useUsuarios } from '../hooks/useUsuarios';
import UsuarioForm from '../components/Admin/UsuarioForm';
import type { ModoMoneda, UserRole } from '../../domain/tipos';

const ROL_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
  tecnico: 'Técnico',
  empleado: 'Empleado',
};

export default function Admin() {
  const sucursal = useStore((s) => s.sucursal);
  const setSucursal = useStore((s) => s.setSucursal);
  const {
    usuarios,
    isLoading: cargandoUsuarios,
    crear: crearUsuario,
    isCreando: creandoUsuario,
    actualizar: actualizarUsuario,
    eliminar: eliminarUsuario,
  } = useUsuarios();

  const [nombre, setNombre] = useState(sucursal?.nombre ?? '');
  const [direccion, setDireccion] = useState(sucursal?.direccion ?? '');
  const [ciudad, setCiudad] = useState(sucursal?.ciudad ?? '');
  const [telefono, setTelefono] = useState(sucursal?.telefono ?? '');
  const [cuit, setCuit] = useState(sucursal?.cuit ?? '');
  const [cotizacionDolar, setCotizacionDolar] = useState(sucursal?.cotizacion_dolar_actual ?? 0);
  const [modoMoneda, setModoMoneda] = useState<ModoMoneda>(sucursal?.modo_moneda ?? 'costo_usd_precio_ars');
  const [logo, setLogo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState('');

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
        cotizacion_dolar_actual: cotizacionDolar || null,
        modo_moneda: modoMoneda,
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

  const handleCrearUsuario = (data: any) => {
    setErrorUsuarios('');
    crearUsuario(data, {
      onSuccess: () => setShowUsuarioForm(false),
      onError: (err: any) => setErrorUsuarios(`❌ Error: ${err.message}`),
    });
  };

  const handleToggleActivo = (id: string, activo: boolean) => {
    actualizarUsuario({ id, updates: { activo: !activo } });
  };

  const handleCambiarRol = (id: string, rol: UserRole) => {
    actualizarUsuario({ id, updates: { rol } });
  };

  const handleEliminarUsuario = (id: string, nombreUsuario: string) => {
    if (
      confirm(
        `¿Eliminar el acceso de "${nombreUsuario}"? Deja de poder usar la app. Esto no borra su cuenta de login, solo el acceso.`
      )
    ) {
      eliminarUsuario(id);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
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
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cotización del dólar
                </label>
                <input
                  type="number"
                  value={cotizacionDolar || ''}
                  onChange={(e) => setCotizacionDolar(parseFloat(e.target.value) || 0)}
                  className="input-field w-full"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 1250"
                  disabled={guardando}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              La cotización queda guardada y se usa como valor por defecto en Ventas y en
              Mercadería. La actualizás acá una vez y no hace falta escribirla cada vez.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ¿Cómo manejás el costo de la mercadería?
              </label>
              <select
                value={modoMoneda}
                onChange={(e) => setModoMoneda(e.target.value as ModoMoneda)}
                className="input-field w-full"
                disabled={guardando}
              >
                <option value="costo_usd_precio_ars">
                  Costo en dólares fijo, precios en pesos
                </option>
                <option value="misma_moneda">Todo en la misma moneda (sin conversión)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {modoMoneda === 'costo_usd_precio_ars'
                  ? 'El costo cargado en cada producto es en dólares y no cambia solo. Al actualizar la cotización, los precios de venta en pesos se reajustan pero el costo en dólares queda igual.'
                  : 'Costo y precios de venta están en la misma moneda, sin conversión entre ellos.'}
              </p>
            </div>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Datos'}
            </button>
          </form>
        )}
      </div>

      <div className="card max-w-2xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            👥 Usuarios
          </h2>
          <button onClick={() => setShowUsuarioForm(true)} className="btn-primary text-sm">
            + Nuevo Usuario
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Gestión de usuarios y permisos por sucursal.
        </p>

        {errorUsuarios && (
          <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm mb-4">
            {errorUsuarios}
          </div>
        )}

        {cargandoUsuarios ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay usuarios cargados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-4">Nombre</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Rol</th>
                  <th className="pb-2 pr-4">Activo</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(usuarios as any[]).map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">{u.nombre}</td>
                    <td className="py-2 pr-4">{u.email ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <select
                        value={u.rol}
                        onChange={(e) => handleCambiarRol(u.id, e.target.value as UserRole)}
                        className="input-field text-xs py-1"
                      >
                        {Object.entries(ROL_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => handleToggleActivo(u.id, u.activo)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.activo
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleEliminarUsuario(u.id, u.nombre)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑 Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUsuarioForm && (
        <UsuarioForm
          onSubmit={handleCrearUsuario}
          onCancel={() => setShowUsuarioForm(false)}
          isLoading={creandoUsuario}
        />
      )}
    </div>
  );
}
