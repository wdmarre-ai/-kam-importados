export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ventas Hoy
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                $0,00
              </p>
            </div>
            <span className="text-2xl">💳</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Reparaciones Pendientes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <span className="text-2xl">🔧</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Stock Bajo
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Clientes Hoy
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Próximamente...
        </h2>
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Gráficos, reportes y métricas en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}
