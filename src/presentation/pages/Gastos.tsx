export default function Gastos() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Gastos
        </h1>
        <button className="btn-primary">+ Nuevo Gasto</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Gastos Mes
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Alquiler
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Servicios
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Sueldos
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Registro de Gastos
        </h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>No hay gastos registrados</p>
        </div>
      </div>
    </div>
  );
}
