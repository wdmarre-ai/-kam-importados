export default function Ventas() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Ventas
        </h1>
        <button className="btn-primary">+ Nueva Venta</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ventas del Mes
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Cantidad de Ventas
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ticket Promedio
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Última Venta
        </h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>No hay ventas registradas</p>
        </div>
      </div>
    </div>
  );
}
