export default function Admin() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Administración
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            👥 Usuarios
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Gestión de usuarios y permisos por sucursal
          </p>
          <button className="btn-primary w-full">Administrar Usuarios</button>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🏢 Sucursales
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Crear y configurar sucursales
          </p>
          <button className="btn-primary w-full">Administrar Sucursales</button>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🏷️ Categorías
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Crear y editar categorías de productos
          </p>
          <button className="btn-primary w-full">Administrar Categorías</button>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            ⚙️ Configuración
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Configuración general de la aplicación
          </p>
          <button className="btn-primary w-full">Abrir Configuración</button>
        </div>
      </div>
    </div>
  );
}
