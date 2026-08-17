export default function Reparaciones() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Reparaciones
        </h1>
        <button className="btn-primary">+ Nueva Reparación</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card border-l-4 border-l-orange-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            En Reparación
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Pendiente Entrega
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Entregadas (Mes)
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ingresos Repara.
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Turnos de Hoy
        </h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>No hay reparaciones programadas para hoy</p>
        </div>
      </div>
    </div>
  );
}
